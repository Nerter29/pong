const Ball = require("./ball");
const Paddle = require("./paddle");


class Game {
    constructor() {
        this.screenSize = [850, 500]

        this.paddleWidth = 12
        this.paddleHeight = 64
        this.paddleStartY = this.screenSize[1] / 2 - this.paddleHeight / 2
        this.paddleSpeed = 4;
        this.paddleXSpacing = 10

        this.paddles = [
            new Paddle(this.screenSize, this.paddleXSpacing, this.paddleStartY, this.paddleWidth,
            this.paddleHeight, this.paddleSpeed),
            new Paddle(this.screenSize, this.screenSize[0] - this.paddleWidth - this.paddleXSpacing,
            this.paddleStartY, this.paddleWidth, this.paddleHeight, this.paddleSpeed)
            ];
        this.paddlesY = {
            0: {y : this.startY},
            1: {y : this.startY}
        };

        this.ballRadius = 3;
        this.ballStartX = this.screenSize[0] / 2 - this.ballRadius
        this.ballStartY = this.screenSize[1] / 2 - this.ballRadius
        this.ballSpeed = 5;
        this.ballStartAngle = Math.PI / 4;
        this.ball = new Ball(this.screenSize, this.ballStartX, this.ballStartY, this.ballRadius, this.ballSpeed, this.ballStartAngle)

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
        
        for(let i = 0; i < this.paddles.length; i++){
            this.paddlesY[i].y = this.paddles[i].getY();
        }
        
        return {
            paddles: this.paddlesY,
            ball: this.ball.getPos()
        };
    }

    getPaddles(){
        return this.paddles;
    }

    getStartInfo(){
        return structuredClone(this.startInfo)
    }
}

module.exports = Game;