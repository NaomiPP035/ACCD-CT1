let thisCanvas = document.getElementById('starfield')
let posX = []
let posY = []
let size = []
let numnStars = 500

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100)


  for (let i = 0; i < numnStars; i++){
   posX.push(random(width))
   posY[i] = random(height)
   size.push(random(2, 6))
  }
}

function draw() {
  background(0, 0, 0)
  fill(0, 0, 100)
  for(let i = 0 ; i < numnStars; i++ ){
  circle(posX[i], posY[i], random(size[i], size[i] + 1));
  }
}

