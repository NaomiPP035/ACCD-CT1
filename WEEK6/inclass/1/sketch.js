let particles = []

function setup() {
  createCanvas(700, 500);
  colorMode(HSB, TWO_PI, 1, 1)

  // for(let i=0); i<10; i++

  for(let i = 0; i < 10; i++){
    particles.push(new Particle())
  }
}

function draw() {
  background(0.1);
  particles.forEach((Mila, i)=>{
    Mila.move()
    Mila.bounce()
    Mila.display()
  })
}

function mouseReleased(){
  particles.push(new Particle(mouseX, mouseY))
}