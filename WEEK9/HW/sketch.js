let handPose;
let video;
let hands = [];

let pg;

// smoothing
let last = null;
let smooth = null;

// stabilizer
let stableFinger = null;
let stableCount = 0;

// brush settings
let brushColor = "red";
let brushSize = 8;
let brushAlpha = 255;

// undo buffer
let history = [];
let saveInterval = 5000;
let lastSaveTime = 0;

// long press
let longPressTimer = 0;
let requiredHold = 2000;

// UI hit areas
const UI = {
  alphaSlider: { x1: 20, x2: 60, y1: 380, y2: 460 },
  sizeSlider:  { x1: 20, x2: 60, y1: 300, y2: 370 },

  colorRed:    { x: 550, y: 40, r: 25 },
  colorGreen:  { x: 600, y: 40, r: 25 },
  colorBlue:   { x: 650, y: 40, r: 25 },

  clearBtn:    { x1: 560, x2: 680, y1: 100, y2: 140 },
  undoBtn:     { x1: 560, x2: 680, y1: 150, y2: 190 },
};

function preload() {
  handPose = ml5.handPose({ flipped: false });
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

  handPose.detectStart(video, gotHands);

  // autosave undo snapshots
  setInterval(() => {
    history.push(pg.get());
    if (history.length > 10) history.shift();
  }, saveInterval);
}

function draw() {
  background(0);

  // mirror video
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // draw layer
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

  // mirror hand
  let fingerX = width - finger.x;
  let fingerY = finger.y;

  // ==== stabilizer ====
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

  // ==== smooth ====
  const x = stableFinger.x;
  const y = stableFinger.y;

  if (!smooth) {
    smooth = { x, y };
  } else {
    const a2 = 0.25;
    smooth.x = a2 * x + (1 - a2) * smooth.x;
    smooth.y = a2 * y + (1 - a2) * smooth.y;
  }

  // detect UI BEFORE drawing
  if (handleUI(smooth.x, smooth.y)) {
    last = null;
    return;
  }

  // draw indicator
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

// ================= UI SYSTEM =================
function handleUI(x, y) {

  // ===== Alpha slider (透明度) =====
  if (inside(UI.alphaSlider, x, y)) {
    brushAlpha = map(y, UI.alphaSlider.y2, UI.alphaSlider.y1, 50, 255);
    brushAlpha = constrain(brushAlpha, 50, 255);
    return true;
  }

  // ===== Size slider (画笔大小) =====
  if (inside(UI.sizeSlider, x, y)) {
    brushSize = map(y, UI.sizeSlider.y2, UI.sizeSlider.y1, 2, 40);
    brushSize = constrain(brushSize, 2, 40);
    return true;
  }

  // ===== Color buttons =====
  if (circleHit(UI.colorRed, x, y)) {
    brushColor = "#FF397C";
    return true;
  }
  if (circleHit(UI.colorGreen, x, y)) {
    brushColor = "#00FF8C";
    return true;
  }
  if (circleHit(UI.colorBlue, x, y)) {
    brushColor = "#00C2FF";
    return true;
  }

  // ===== Clear long-press =====
  if (inside(UI.clearBtn, x, y)) {
    longPressTimer += deltaTime;
    if (longPressTimer > requiredHold) {
      pg.clear();
      longPressTimer = 0;
    }
    return true;
  }

  // ===== Undo long-press =====
  if (inside(UI.undoBtn, x, y)) {
    longPressTimer += deltaTime;
    if (longPressTimer > requiredHold) {
      if (history.length > 0) {
        pg.image(history[0], 0, 0);
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
