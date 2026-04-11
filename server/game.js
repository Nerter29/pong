const Ball = require("./ball");
const Paddle = require("./paddle");


class Game {
    constructor() {
        this.screenSize = [700, 500]

        this.paddleWidth = 20
        this.paddleHeight = 100
        this.paddleStartY = this.screenSize[1] / 2 - this.paddleHeight / 2
        this.paddleSpeed = 5;
        this.paddleXSpacing = 10

        this.paddles = {
            0: new Paddle(this.screenSize, this.paddleXSpacing, this.paddleStartY, this.paddleWidth,
            this.paddleHeight, this.paddleSpeed),
            1: new Paddle(this.screenSize, this.screenSize[0] - this.paddleWidth - this.paddleXSpacing,
            this.paddleStartY, this.paddleWidth, this.paddleHeight, this.paddleSpeed)
        };
        this.paddlesY = {
            0: {y : this.startY},
            1: {y : this.startY}
        };

        this.ballRadius = 4;
        this.ballStartX = this.screenSize[0] / 2 - this.ballRadius
        this.ballStartY = this.screenSize[1] / 2 - this.ballRadius
        this.ballSpeed = 6;
        this.ball = new Ball(this.screenSize, this.ballStartX, this.ballStartY, this.ballRadius, this.ballSpeed)

        this.startInfo = {
            screenWidth : this.screenSize[0],
            screenHeight : this.screenSize[1],
            paddles : {
                0 : {startX : this.paddleXSpacing, startY : this.paddleStartY},
                1 : {startX : this.screenSize[0] - this.paddleWidth - this.paddleXSpacing, startY : this.paddleStartY}
            },
            paddleWidth : this.paddleWidth,
            paddleHeight : this.paddleHeight,

            ballStartX : this.ballStartX,
            ballStartY : this.ballStartY,
            ballRadius : this.ballRadius
            
        }

    }

    handleInput(playerId, input) {
        let paddle = this.paddles[playerId];
        if (paddle){
            paddle.move(input)
        }
    }

    getState() {
        
        for(let i = 0; i < 2; i++){
            this.paddlesY[i].y = this.paddles[i].getY();
        }
        
        return {
            paddles: this.paddlesY,
            ball: this.ball.getPos()
        };
    }

    getStartInfo(){
        return structuredClone(this.startInfo)
    }
}

module.exports = Game;