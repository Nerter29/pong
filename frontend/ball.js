import {lerp}  from './utils.js';


export class Ball{
    constructor(x, y, radius, color, trailLength){
        this.posBuffer = []
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color
        this.trail = []
        this.trailLength = trailLength

        this.trailStartHue = 0.4
        this.minTrailRadius = 0.5
        

    }
    draw(ctx){
        //draw trail

        for (let i = 0; i < this.trail.length; i++) {
            let trailPoint = this.trail[i];
            var radius = this.radius * ((i * (1 - this.minTrailRadius)) / this.trail.length + this.minTrailRadius)
            ctx.globalAlpha = (i * this.trailStartHue) / this.trail.length
            ctx.beginPath();
            ctx.arc(trailPoint.x, trailPoint.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.globalAlpha = 1
        }

        //draw ball
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill()
    }

        
    move(x, y){
        this.x = x
        this.y = y;

        this.trail.push({ x: this.x, y: this.y });

        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
    }
}

