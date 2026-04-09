import {lerp}  from './utils.js';


export class Ball{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color

    }
    draw(ctx){
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    }
    
    move(x, y){
        this.x = x;
        this.y = y;
    }
}

