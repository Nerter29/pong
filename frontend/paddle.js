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

export function spawnPaddles(paddleList, canvasSize, startY, paddleWidth, paddleHeight){

    for(let id = 0; id < 2; id++){

        var x = 0;

        if(id == 0){
            x = 10
        }
        else{
            x = canvasSize[0] - paddleWidth
        }

        const paddle = new Paddle(x, startY, paddleWidth, paddleHeight)

        paddleList.push(paddle)
    }
    
}