let particles = []
let PPF = 10
let gravity

function setup() {
  createCanvas(400, 600);
  colorMode(HSB,(TWO_PI), 0.9, 0,9)
  particles.push(new Particle(random(width),0))
}

function draw() {
  background(0);

  for(let i = 0; i < PPF; i++){
    particles.push(new Particle(random(width),0))

    gravity = createVector(0, 3,)
  }

  //if(random()<0.1){
  //  particles.push(new Particle(random(width), 0))
  //}
  
  particles. forEach((p, i)=>{
  if(!p.inBounds()){
    particles.splice(i, 1)
  }
  p.applyForce(gravity)

    p.move()
    p.display()
  })
}