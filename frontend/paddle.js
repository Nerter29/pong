import {lerp}  from './utils.js';


class Paddle{
    constructor(x, y, width, height, color, borderRadius){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height
        this.color = color
        this.borderRadius = borderRadius

    }
    draw(ctx){
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, this.borderRadius);
        ctx.fillStyle = this.color;
        ctx.fill();
        
    }
    
    move(y){
        this.y = y;
    }
}

export function spawnPaddles(paddleList, canvasSize, startInfo, paddleColor, paddleBorderRadius){

    for(let id = 0; id < 2; id++){
        const startPlayerInfo = startInfo.paddles[id]
        const paddle = new Paddle(startPlayerInfo.startX, startPlayerInfo.startY, startInfo.paddleWidth, startInfo.paddleHeight, paddleColor, paddleBorderRadius)

        paddleList.push(paddle)
    }
    
}