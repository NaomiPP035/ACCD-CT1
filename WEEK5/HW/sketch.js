let circlePosX;
let circlePosY;
let circleVelX;
let circleVelY;
let circleRadius = 30;
let accelY = 0.3;
let startTime;
let bounceStarted = false;
let squareSize = 40;
let osc;
let started = false;
let noiseTime = 0;
let ball;
let gravity = 0.4;
let bounce = -0.8;
let playing = false;
let cnv;

function setup() {
  createCanvas(600, 600);
  
  circlePosX = random(circleRadius, width - circleRadius);
  circlePosY = circleRadius;
  circleVelX = random(-3, 3);
  circleVelY = 0;
  
  startTime = millis();

  noiseSeed(random(100));

  osc = new p5.Oscillator('sine');
  osc.amp(0.2);

  textAlign(CENTER, CENTER);
  textSize(20);
  fill(255);
  text("🔊 CLICK TO START", width/2, height/2);
}

function draw() {
  background(0, 220, 0);
  
  let elapsedTime = millis() - startTime;
  if (elapsedTime >= 3000) {
    bounceStarted = true;
  }
  
  if (bounceStarted) {
    circleVelY += accelY;
    circlePosX += circleVelX;
    circlePosY += circleVelY;
    
    if (circlePosY + circleRadius >= height || circlePosY - circleRadius <= 0) {
      circleVelY = circleVelY * -0.99;
      if (circlePosY + circleRadius >= height) {
        circlePosY = height - circleRadius;
      } 
      else {
        circlePosY = circleRadius;
      }
    }
    if (circlePosX + circleRadius >= width || circlePosX - circleRadius <= 0) {
  circleVelX = circleVelX * -0.99;
  if (circlePosX + circleRadius >= width) {
    circlePosX = width - circleRadius;
  } else {
    circlePosX = circleRadius;
  }
}
  }

  fill(100, 150, 255);
  noStroke();
  circle(circlePosX, circlePosY, circleRadius * 2);

  let squareProgress = (sin(millis() * 0.0008) + 1) / 2;  
  let squarePosX = lerp(squareSize / 2, width - squareSize / 2, squareProgress);
  let squarePosY = lerp(squareSize / 2, height - squareSize / 2, squareProgress);

  fill(255, 100, 100);
  rectMode(CENTER);
  noStroke();
  rect(squarePosX, squarePosY, squareSize, squareSize);

  push();
  translate(width / 2, height / 2);
  fill(150, 255, 150, 150);
  noStroke();
  
  beginShape();
  let numPoints = 8;
  for (let i = 0; i < numPoints; i++) {
    let angle = map(i, 0, numPoints, 0, TWO_PI);
    let noiseValue = noise(i * 0.5, millis() * 0.0005);
    let radius = map(noiseValue, 0, 1, 80, 150);
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
  pop();

  if (started) {
    noiseTime += 0.01;
    let n = noise(noiseTime);
    let freq = map(n, 0, 1, 200, 800);
    osc.freq(freq);
  }
}

function mousePressed() {
  if (!started) {
    userStartAudio(); 
    osc.start();
    started = true;
  }
}
