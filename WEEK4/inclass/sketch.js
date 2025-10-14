let posX
let posY

let velX
let velY

let radius = 20

function setup() {
  createCanvas(600, 600);

  colorMode(HSB, width, 100, 100)
posX = width * 0.5;
posY = height * 0.5;

velX = random(-4, 4);
velY = random(-3, 3);
}

  function draw() {
    posX += velX
    posY += velY

    if (posY + radius >= height || posY - radius <= 0){
      velY = velY * -1
    }
    if (posX + radius >= width || posX - radius<= 0){
      velX = velX * -1
    }

   background(0, 0, 85);

   noStroke()

   fill(posX, 100, 100)
   circle(posX, posY, radius * 2);

   stroke(255, 0, 0)
   strokeWeight(6)
   fill(width * 0.75, 100, 100)
   rect(width * 0.5 - 50, height * 0.5 - 50, 100, 100)
   }
