class Paddle{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height

    }
    draw(ctx){
        //ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
    }
    
    move(y){
        this.y = y;
    }
}

export function spawnPaddles(paddleList, canvasSize, startInfo){

    for(let id = 0; id < 2; id++){
        const startPlayerInfo = startInfo.players[id]
        const paddle = new Paddle(startPlayerInfo.startX, startPlayerInfo.startY, startInfo.paddleWidth, startInfo.paddleHeight)

        paddleList.push(paddle)
    }
    
}