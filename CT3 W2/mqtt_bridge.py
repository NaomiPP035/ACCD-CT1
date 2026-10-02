"""MQTT -> USB serial bridge for Naomi's Uno door. Ctrl+C stops it."""
import time
import queue
import serial
import paho.mqtt.client as mqtt

PORT = 'COM4'
BAUD = 9600
HOST = '127.0.0.1'
MQTT_PORT = 1884
TOPIC = 'naomi/ct3w2/door/command'
STATUS_TOPIC = 'naomi/ct3w2/bridge/status'
DOOR_STATE_TOPIC = 'naomi/ct3w2/door/state'
HEARTBEAT_SECONDS = 2
commands = queue.Queue(maxsize=1)
initial_state_pending = True

def on_connect(client, userdata, flags, reason_code, properties):
    global initial_state_pending
    if reason_code.is_failure:
        print(f'MQTT connection rejected: {reason_code}', flush=True)
        return
    client.subscribe(TOPIC, qos=0)
    client.publish(STATUS_TOPIC, 'RUNNING', qos=1, retain=True)
    # Opening the serial port resets the Uno to the closed angle in setup().
    # 打开串口后 Uno 会在 setup() 中回到关门角度，因此首次连接时同步关门状态。
    if initial_state_pending:
        client.publish(DOOR_STATE_TOPIC, 'CLOSE', qos=1, retain=True)
        initial_state_pending = False

def on_subscribe(client, userdata, mid, reason_codes, properties):
    if any(code.is_failure for code in reason_codes):
        print('MQTT subscription failed.', flush=True)
    else:
        print(f'MQTT ready. Listening on {TOPIC}', flush=True)

def on_disconnect(client, userdata, flags, reason_code, properties):
    if reason_code.is_failure:
        print('MQTT disconnected. Reconnecting...', flush=True)

def on_message(client, userdata, message):
    if message.retain:
        print('Ignored saved/retained command.', flush=True)
        return
    if message.payload not in (b'OPEN', b'CLOSE'):
        print('Ignored command: expected OPEN or CLOSE.', flush=True)
        return
    if commands.full():
        try:
            commands.get_nowait()
        except queue.Empty:
            pass
    commands.put_nowait((time.monotonic(), message.payload))

def main():
    board = None
    last_heartbeat = 0.0
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2,
                         client_id='naomi-uno-com4-bridge', clean_session=True)
    # 程序异常退出时，由 MQTT 自动发布暂停状态。
    # MQTT publishes PAUSED automatically if the bridge exits unexpectedly.
    client.will_set(STATUS_TOPIC, payload='PAUSED', qos=1, retain=True)
    client.on_connect = on_connect
    client.on_subscribe = on_subscribe
    client.on_disconnect = on_disconnect
    client.on_message = on_message
    client.reconnect_delay_set(min_delay=1, max_delay=10)
    try:
        print(f'Opening {PORT} at {BAUD}. Close the Arduino serial monitor first.', flush=True)
        board = serial.Serial(PORT, BAUD, timeout=0.1, write_timeout=1)
        # Opening USB serial usually resets the Uno. Let setup() finish.
        time.sleep(2.5)
        board.reset_input_buffer()
        print(f'Arduino serial connected: {PORT}', flush=True)
        client.connect(HOST, MQTT_PORT, keepalive=30)
        client.loop_start()
        while True:
            now = time.monotonic()
            if client.is_connected() and now - last_heartbeat >= HEARTBEAT_SECONDS:
                client.publish(STATUS_TOPIC, 'RUNNING', qos=0, retain=True)
                last_heartbeat = now
            try:
                received, payload = commands.get_nowait()
            except queue.Empty:
                pass
            else:
                if client.is_connected() and time.monotonic() - received < 2:
                    board.write(payload + b'\n')
                    client.publish(DOOR_STATE_TOPIC, payload, qos=1, retain=True)
                    print(f'Sent to Arduino: {payload.decode()}', flush=True)
            reply = board.readline().decode('utf-8', errors='replace').strip()
            if reply:
                print(f'Arduino: {reply}', flush=True)
    except KeyboardInterrupt:
        print('\nStopped.')
    except serial.SerialException as error:
        print(f'Serial error: {error}\nCheck COM4, USB cable and serial monitor.')
    except OSError as error:
        print(f'Connection error: {error}\nStart Mosquitto on port 1884 first.')
    finally:
        if client.is_connected():
            status_message = client.publish(STATUS_TOPIC, 'PAUSED', qos=1, retain=True)
            status_message.wait_for_publish(timeout=2)
        client.disconnect()
        client.loop_stop()
        if board is not None:
            board.close()

if __name__ == '__main__':
    main()
