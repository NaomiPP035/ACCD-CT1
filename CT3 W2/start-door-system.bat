@echo off
setlocal

rem Door project one-click launcher.
rem Keep this file in the same folder as the HTML, Python and MQTT config files.

set "PROJECT_DIR=%~dp0"
set "MOSQUITTO_EXE=E:\Mosquitto\mosquitto.exe"
set "WEB_URL=http://127.0.0.1:5500/gesture-door.html"

where python >nul 2>&1
if errorlevel 1 (
  echo Python was not found. Reopen this file after Python is available in PATH.
  pause
  exit /b 1
)

if not exist "%MOSQUITTO_EXE%" (
  echo Mosquitto was not found at %MOSQUITTO_EXE%
  pause
  exit /b 1
)

echo Starting the local MQTT broker...
start "Door MQTT Broker" "%MOSQUITTO_EXE%" -c "%PROJECT_DIR%mosquitto-door.conf" -v
timeout /t 2 /nobreak >nul

echo Starting the MQTT-to-Arduino bridge...
start "Door Python Bridge" cmd /k python "%PROJECT_DIR%mqtt_bridge.py"
timeout /t 3 /nobreak >nul

echo Starting the local webpage server...
start "Door Web Server" cmd /k python -m http.server 5500 --bind 127.0.0.1 --directory "%PROJECT_DIR%."
timeout /t 2 /nobreak >nul

echo Opening the control webpage...
start "" "%WEB_URL%"

echo.
echo The door system has started. Keep the three command windows open.
echo You may close this launcher window.
timeout /t 5 /nobreak >nul
endlocal
