let handPose
let video

let hands =[]
let thumbTip,indexTip

let paddle, pong, score

function preload(){
  handPose = ml5.handPose({flipped: true});
}

function setup() {
  createCanvas(640, 500);
  
  video = createCapture(VIDEO, {flipped: true});
  video.size(640,480)
  video.hide()
  
  rectMode(CORNERS);  
  paddle = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    
  }
  
  pong = {
    pos: createVector(width*0.5, height*0.5),
    vel: createVector(random(-3, 3), random(-3, 3)),
    radius: 10,
    clr:color(255, 0, 0)
  }
  
  score = 0

  handPose.detectStart(video, gotHands)
}

function draw() {
  background(220);
  
  image(video, 0, 0, 640, 480)
  pong.pos.add(pong.vel);
  if(pong.pos.x - pong.radius <= 0){
    pong.vel.x *= -1
  }
  if(pong.pos.y - pong.radius <= 0 || pong.pos.y + pong.radius >= height){
    pong.vel.y *=-1;
  }
  
  if(hands.length > 0){
    fill(0, 0, 255)
    rect(paddle.x1, paddle.y1, paddle.x2, paddle.y2)
    
    if (
      pong.pos.x + pong.radius >= paddle.x1 && 
      pong.pos.y - pong.radius >= paddle.y1 && 
      pong.pos.y + pong.radius <= paddle.y2
    ){
      pong.vel.x *= -1
      score++
      console.log(score)
    }
    
    fill(0, 255, 0)
    circle(thumbTip.x, thumbTip.y, 10)
    circle(indexTip.x, indexTip.y, 10)
  } //if hand.length > 0
  
  fill(pong.clr)
  circle(pong.pos.x, pong.pos.y, pong.radius *2)
}//draw

function gotHands(results){
  //console.log(results)
  hands = results
  if(hands.length > 0){
    indexTip = hands[0].index_finger_tip;
    paddle.x1 = indexTip.x;
    paddle.y1 = indexTip.y
    
    thumbTip = hands[0].thumb_tip;
    paddle.x2 = thumbTip.x + 15;
    paddle.y2 = thumbTip.y
    
    indexTip = hands[0].index_finger_tip
    paddle.x2 = thumbTip.x+15
    paddle.y2 = thumbTip.y
  }
}