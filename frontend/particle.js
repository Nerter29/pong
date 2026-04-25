import { hexToHsl, randomInRange, randomWithOpposite } from "./utils.js";

export class Particle {

    constructor(x, y, directionAngle, direction, color, angleDiff, speed, speedDiff) {
        this.x = x;
        this.y = y;


        this.speed = speed + randomWithOpposite(speedDiff)

        var angle = directionAngle + randomWithOpposite(angleDiff)
        this.vx = direction * Math.cos(angle) * this.speed;
        this.vy = -Math.sin(angle) * this.speed;

        this.baseStartLife = 2500
        this.lifeDiff = 1000
        this.startLife = this.baseStartLife + randomWithOpposite(this.lifeDiff);
        this.life = this.startLife;

        this.radiusDiff = 0.5
        this.startRadius = 1.2 + randomWithOpposite(this.radiusDiff);

        this.radius = this.startRadius

        this.hueDiff = 10
        this.luminosityDiff = 10

        var hsl = hexToHsl(color)
        this.hue = randomInRange(-this.hueDiff, this.hueDiff) + hsl[0]
        this.saturation = hsl[1]
        this.luminosity = randomWithOpposite(this.luminosityDiff) + hsl[2]

        this.gravityDiff = 0.001
        this.gravity = 0.0015 + randomWithOpposite(this.gravityDiff)
    }

    update(dt) {
        if(this.life >= 0){
            this.x += this.vx * dt;
            this.y += this.vy * dt

            this.vy += this.gravity

            this.life -= dt;
            
        }
    }

    draw(ctx) {
        if(this.life > 0){
            var lifeProporion = Math.max(this.life / this.startLife, 0);
            this.radius = lifeProporion * this.startRadius
            ctx.globalAlpha = lifeProporion
            ctx.beginPath()
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.luminosity}%)`;
            ctx.fill()
            ctx.globalAlpha = 1;
        }
    }
}

export function spawnParticlePatch(particles, x, y, angle, direction, num, color, angleDiff, speed, speedDiff) {
    //spawns num particles in a new patch of particles list

    //we look for null particles patch in our list
    var patchIndex = null
    for(let i = 0; i < particles.length; i++){
        //if we found a hole, we will fill it, by replacing it with the new patch
        if(particles[i] == null){
            patchIndex = i
            particles[i] = []
        }
    }
    //if we don't find any hole, we add a new patch slot to our list
    if(patchIndex == null){
        particles.push([])
        patchIndex = particles.length - 1
    }
    
    var particleMaxLife = 0
    for (let i = 0; i < num; i++) {
        var p = new Particle(x, y, angle, direction, color, angleDiff, speed, speedDiff)
        particles[patchIndex].push(p);
        particleMaxLife = p.baseStartLife + p.lifeDiff
    }
    //we say now to delete the patch when every particles will be dead, in particleMaxLife milliseconds.
    setTimeout(() =>{
        particles[patchIndex] = null
    }, particleMaxLife)
}
export function updateParticles(particles, dt, ctx) {
    
    for (let i = particles.length - 1; i >= 0; i--) {
        if(particles[i] != null){
            for(let j = 0; j < particles[i].length; j++){
                var particle = particles[i][j]
                particle.update(dt);
                particle.draw(ctx);  
            }
        }
        
    }
}