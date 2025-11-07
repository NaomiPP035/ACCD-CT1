let mode = "Shanghai";
let dayCount = 0;
let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

let cars = [];
let raining = false;
let trafficJam = false;
let trafficFreeze = false;
let bgColor;

let spacePressed = false;
let spacePressTime = 0;
let loadingProgress = 0;
let dayAdvanced = false;

function setup() {
  let canvas = createCanvas(800, 500);
  
  window.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  
  canvas.elt.setAttribute('tabindex', '0');
  canvas.elt.style.outline = 'none';
  canvas.elt.focus();
  
  const helpText = document.querySelector('.help-text');
  if (helpText) {
    helpText.parentNode.insertBefore(canvas.elt, helpText.nextSibling);
  }
  
  noStroke();
  bgColor = color(180);
  initCars();
  
  document.body.addEventListener('click', function() {
    canvas.elt.focus();
  });
}

function initCars() {
  cars = [];
  let attempts = 0;
  let maxAttempts = 5000;
  
  while (cars.length < 250 && attempts < maxAttempts) {
    attempts++;
    
    let carColor;
    if (mode === "Shanghai") {
      carColor = random(1) < 0.5 ? color(0) : color(random(255), random(255), random(255));
    } else if (mode === "LA" || mode === "Vegas") {
      carColor = color(random(255), random(255), random(255));
    }

    let newCar = {
      x: random(width),
      baseY: random(height / 2, height - 50),
      offset: random(TWO_PI),
      c: carColor,
      size: random(24, 48),
      baseSpeed: random(0.8, 2.5),
      waveSpeed: random(0.015, 0.03)
    };
    
    let overlapping = false;
    for (let car of cars) {
      let d = dist(newCar.x, newCar.baseY, car.x, car.baseY);
      if (d < (newCar.size + car.size) / 2) {
        overlapping = true;
        break;
      }
    }
    
    if (!overlapping) {
      cars.push(newCar);
    }
  }
}

function draw() {
  background(bgColor);
  drawSky();
  drawRain();
  drawCars();
  drawInfo();
  drawLoadingBar();
  
  updateSpacePress();
}

function drawSky() {
  if (mode === "Shanghai") bgColor = color(160, 160, 255);
  else if (mode === "LA") bgColor = color(150, 200, 255);
  else if (mode === "Vegas") bgColor = color(240, 220, 180);
}

function drawRain() {
  if (raining) {
    stroke(250, 250, 250);
    strokeWeight(2);
    for (let i = 0; i < 150; i++) {
      let x = random(width);
      let y = random(height);
      line(x, y, x + 2, y + 20);
    }
    noStroke();
  }
}

function drawCars() {
  for (let car of cars) {
    let moveSpeed = car.baseSpeed;

    if (trafficFreeze) {
      moveSpeed *= 0.04;
      car.x += random(-0.5, 0.5);
      car.baseY += random(-0.3, 0.3);
    } else if (trafficJam) {
      moveSpeed *= 0.2;
    }

    if (trafficJam || trafficFreeze) {
      car.size = constrain(car.size + random(-0.05, 0.1), 24, 54);
    }

    car.x += moveSpeed;
    if (car.x > width + 10) {
      car.x = -10;
      car.baseY = random(height / 2, height - 50);
    }
  }
  
  for (let car of cars) {
    fill(car.c);
    let yWave = sin(frameCount * car.waveSpeed + car.offset) * 15;
    ellipse(car.x, car.baseY + yWave, car.size);
  }
}

function drawInfo() {
  fill(0);
  textSize(18);
  textAlign(LEFT);
  text(`Mode: ${mode}`, 20, 30);
  text(`Day: ${days[dayCount % 7]}`, 20, 55);
  text(`Rain: ${raining ? "Yes" : "No"}`, 20, 80);
  
  if (trafficFreeze) {
    fill(255, 0, 0);
    text("Traffic: PARALYZED ⚠️", 20, 105);
  } else if (trafficJam) {
    fill(0);
    text("Traffic: Jammed 💀", 20, 105);
  } else {
    fill(0);
    text("Traffic: Smooth ✅", 20, 105);
  }
}

function drawLoadingBar() {
  if (spacePressed && !trafficFreeze) {
    let barWidth = 300;
    let barHeight = 20;
    let x = width / 2 - barWidth / 2;
    let y = height - 40;
    
    fill(200);
    rect(x, y, barWidth, barHeight, 10);
    
    fill(0, 150, 255);
    rect(x, y, barWidth * loadingProgress, barHeight, 10);
    
///    fill(0);
///    textAlign(CENTER);
///    text("Hold SPACE to advance day", width / 2, y - 10);
///    textAlign(LEFT);
  }
}

function updateSpacePress() {
  if (spacePressed && !trafficFreeze) {
    let pressDuration = (millis() - spacePressTime) / 1000;
    loadingProgress = constrain(pressDuration / 1, 0, 1);
    
    if (pressDuration >= 1 && !dayAdvanced) {
      dayCount++;
      simulateWeatherAndTraffic();
      dayAdvanced = true;
    }
  }
}

function mousePressed() {
  if (trafficFreeze) {
    let minDist = Infinity;
    let closestIndex = -1;
    
    for (let i = 0; i < cars.length; i++) {
      let car = cars[i];
      let yWave = sin(frameCount * car.waveSpeed + car.offset) * 15;
      let d = dist(mouseX, mouseY, car.x, car.baseY + yWave);
      if (d < minDist && d < car.size / 2) {
        minDist = d;
        closestIndex = i;
      }
    }
    
    if (closestIndex !== -1) {
      cars.splice(closestIndex, 1);
    }
    
    if (cars.length < 90) {
      trafficFreeze = false;
      trafficJam = false;
      dayAdvanced = false;
    }
  }
}

function simulateWeatherAndTraffic() {
  let rainProb, trafficProb;
  let today = days[dayCount % 7];
  let weekend = today === "Saturday" || today === "Sunday";

  if (mode === "Shanghai") {
    rainProb = 0.4;
    trafficProb = weekend ? 0.5 : 0.6;
  } else if (mode === "LA") {
    rainProb = 0.3;
    trafficProb = 0.4;
  } else if (mode === "Vegas") {
    rainProb = 0.1;
    trafficProb = weekend || today === "Friday" ? 0.5 : 0.4;
  }

  raining = random(1) < rainProb;
  trafficJam = random(1) < trafficProb;

  if (raining && trafficJam) {
    trafficFreeze = true;
    dayAdvanced = false;
  }
}

function keyPressed() {
  if (key === "1") {
    mode = "Shanghai";
    initCars();
    dayAdvanced = false;
  } else if (key === "2") {
    mode = "LA";
    initCars();
    dayAdvanced = false;
  } else if (key === "3") {
    mode = "Vegas";
    initCars();
    dayAdvanced = false;
  } else if (key === " ") {
    if (!trafficFreeze) {
      spacePressed = true;
      spacePressTime = millis();
      loadingProgress = 0;
      dayAdvanced = false;
    }
  }
  
}

function keyReleased() {
  if (key === " ") {
    spacePressed = false;
    loadingProgress = 0;
  }
}