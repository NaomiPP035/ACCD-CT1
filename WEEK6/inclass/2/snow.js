class Particle {
 constructor(_x, _y) {
   this.pos = createVector(_x, _y)
   this.vel = createVector(random(-3,3), random(-4,4))
   this.acc = createVector(0, 0)

   this. radius = random(2,4)
   this.clr = color(random(TWO_PI), 0.8, 0.8)
 }

 move(){
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    
 }

 applyForce(_force){
    this.acc.add(_force)
    this.vel.limit(1)
 }

 inBounds(){
   if(
   this.pos.x - this.radius < 0 ||
   this.pos.x + this.radius > width ||
   this.pos.y + this.radius > height
   ){
      return false
   }
   else{
      return true
   }
}


 display(){
    fill(this.clr)
    circle(this.pos.x, this.pos.y, this.radius*2)
 }//end
}//end of class