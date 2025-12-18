let handPose;
let video;
let hands = [];

let pg;


let uiImg;

const UI_IMG = {
  origW: 2048,
  origH: 1344,
  displayW: 700, 
  offsetX: 20,
  offsetY: 20
};

const WHEEL_BOX = { x1: 27, x2: 145, y1: 30, y2: 156 };

function rgbToHex(r, g, b) {
  const to2 = (v) => v.toString(16).padStart(2, "0");
  return "#" + to2(r) + to2(g) + to2(b);
}


let last = null;
let smooth = null;

let stableFinger = null;
let stableCount = 0;

let brushColor = "red";
let brushSize = 8;
let brushAlpha = 255;

let history = [];
let saveInterval = 5000;
let lastSaveTime = 0;

let longPressTimer = 0;
let requiredHold = 2000;

const UI = {
  wheel: null,

  alphaSlider: { x1: 20, x2: 60,  y1: 220, y2: 320 },
  sizeSlider:  { x1: 70, x2: 110, y1: 220, y2: 320 },

  clearBtn:    { x1: 20, x2: 110, y1: 340, y2: 370 },
  undoBtn:     { x1: 20, x2: 110, y1: 380, y2: 410 },
};


function preload() {
  handPose = ml5.handPose({ flipped: false });
  uiImg = loadImage('ui.png');
}

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent("sketch-holder");

  video = createCapture(
    { video: { facingMode: "user" }, audio: false }
  );
  video.elt.setAttribute("playsinline", "");
  video.size(width, height);
  video.hide();

  pg = createGraphics(width, height);
  pg.clear();

  const scaleUI = UI_IMG.displayW / UI_IMG.origW;
  UI.wheel = {
    cx: UI_IMG.offsetX + ((WHEEL_BOX.x1 + WHEEL_BOX.x2) / 2) * scaleUI,
    cy: UI_IMG.offsetY + ((WHEEL_BOX.y1 + WHEEL_BOX.y2) / 2) * scaleUI,
    r:  ((WHEEL_BOX.x2 - WHEEL_BOX.x1) / 2) * scaleUI,
    scale: scaleUI
  };


  handPose.detectStart(video, gotHands);

  setInterval(() => {
    history.push(pg.get());
    if (history.length > 10) history.shift();
  }, saveInterval);
}

function draw() {
  background(0);
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  image(pg, 0, 0);

  if (hands.length === 0) {
    resetTracking();
    return;
  }

  let hand = hands[0];
  let finger = hand.index_finger_tip;
  if (!finger) {
    resetTracking();
    return;
  }

  let fingerX = width - finger.x;
  let fingerY = finger.y;

  if (!stableFinger) {
    stableFinger = { x: fingerX, y: fingerY };
    stableCount = 1;
    return;
  } else {
    const a1 = 0.5;
    stableFinger.x = a1 * fingerX + (1 - a1) * stableFinger.x;
    stableFinger.y = a1 * fingerY + (1 - a1) * stableFinger.y;
    stableCount++;
    if (stableCount < 3) return;
  }

  const x = stableFinger.x;
  const y = stableFinger.y;

  if (!smooth) {
    smooth = { x, y };
  } else {
    const a2 = 0.25;
    smooth.x = a2 * x + (1 - a2) * smooth.x;
    smooth.y = a2 * y + (1 - a2) * smooth.y;
  }

  if (handleUI(smooth.x, smooth.y)) {
    last = null;
    return;
  }

  fill(0, 255, 0);
  noStroke();
  circle(smooth.x, smooth.y, 14);

  // drawing
  if (last) {
    const d = dist(smooth.x, smooth.y, last.x, last.y);
    if (d >= 2 && d <= 60) {
      pg.stroke(brushColor);
      pg.strokeWeight(brushSize);
      pg.stroke(brushColor + hex(brushAlpha, 2));
      pg.line(last.x, last.y, smooth.x, smooth.y);
    }
  }

  last = { x: smooth.x, y: smooth.y };
}

function handleUI(x, y) {

  if (UI.wheel && dist(x, y, UI.wheel.cx, UI.wheel.cy) < UI.wheel.r) {
    const ix = Math.floor((x - UI_IMG.offsetX) / UI.wheel.scale);
    const iy = Math.floor((y - UI_IMG.offsetY) / UI.wheel.scale);
    if (uiImg && ix >= 0 && iy >= 0 && ix < uiImg.width && iy < uiImg.height) {
      const c = uiImg.get(ix, iy); // [r,g,b,a]
      if (c[3] > 0 && (c[0] + c[1] + c[2]) > 30) {
        brushColor = rgbToHex(c[0], c[1], c[2]);
      }
    }
    return true;
  }

  if (inside(UI.alphaSlider, x, y)) {
    brushAlpha = map(y, UI.alphaSlider.y2, UI.alphaSlider.y1, 50, 255);
    brushAlpha = constrain(brushAlpha, 50, 255);
    return true;
  }

  if (inside(UI.sizeSlider, x, y)) {
    brushSize = map(y, UI.sizeSlider.y2, UI.sizeSlider.y1, 2, 40);
    brushSize = constrain(brushSize, 2, 40);
    return true;
  }

  if (inside(UI.clearBtn, x, y)) {
    longPressTimer += deltaTime;
    if (longPressTimer > requiredHold) {
      pg.clear();
      longPressTimer = 0;
    }
    return true;
  }

  if (inside(UI.undoBtn, x, y)) {
    longPressTimer += deltaTime;
    if (longPressTimer > requiredHold) {
      if (history.length > 0) {
        pg.image(history[history.length - 1], 0, 0);
      }
      longPressTimer = 0;
    }
    return true;
  }

  longPressTimer = 0;
  return false;
}

// helpers
function inside(rect, x, y) {
  return x > rect.x1 && x < rect.x2 && y > rect.y1 && y < rect.y2;
}

function circleHit(circle, x, y) {
  return dist(x, y, circle.x, circle.y) < circle.r;
}

function resetTracking() {
  last = null;
  smooth = null;
  stableFinger = null;
  stableCount = 0;
}

function gotHands(results) {
  hands = results;
}
