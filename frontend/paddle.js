import {lerp}  from './utils.js';


class Paddle{
    constructor(x, y, width, height, color){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height
        this.color = color

    }
    draw(ctx){
        //ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
    }
    
    move(y){
        this.y = y;
    }
}

export function spawnPaddles(paddleList, canvasSize, startInfo, paddleColor){

    for(let id = 0; id < 2; id++){
        const startPlayerInfo = startInfo.paddles[id]
        const paddle = new Paddle(startPlayerInfo.startX, startPlayerInfo.startY, startInfo.paddleWidth, startInfo.paddleHeight, paddleColor)

        paddleList.push(paddle)
    }
    
}