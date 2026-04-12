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

export function spawnPaddles(playerId, paddleList, canvasSize, startInfo, playerColor, oppenentColor, paddleBorderRadius){

    for(let id = 0; id < 2; id++){
        var color = playerColor;
        if(id != playerId){
            color = oppenentColor
        }
        const startPlayerInfo = startInfo.paddles[id]
        const paddle = new Paddle(startPlayerInfo.startX, startPlayerInfo.startY, startInfo.paddleWidth, startInfo.paddleHeight, color, paddleBorderRadius)

        paddleList.push(paddle)
    }
    
}