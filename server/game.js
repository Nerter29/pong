const Ball = require("./ball");
const Paddle = require("./paddle");


class Game {
    constructor() {
        this.screenSize = [750, 500]

        this.paddleWidth = 12
        this.paddleHeight = 70
        this.paddleStartY = this.screenSize[1] / 2 - this.paddleHeight / 2
        this.paddleSpeed = 3;
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
        this.scores = {
            0 : 0,
            1 : 0
        }
        this.winCondition = 7
        this.gameEnded = false;
        this.winner = null;
        this.hasToResetScore = false

        this.ballRadius = 3;
        this.ballStartX = this.screenSize[0] / 2 
        this.ballStartY = this.screenSize[1] / 2
        this.ballSpeed = 4.8;
        this.ballStartSpeed = 2.25;
        this.ballStartAngle = Math.PI / 4;
        this.ballEffectStrength = 0.003
        this.ball = null

        this.spawnBall();

        this.countdownDuration,
        this.countdownTimer,
        this.startIn,

        this.startCountdown = 3000
        this.winCountdown = 9000
        
        this.resetCountdown(this.startCountdown)
        

        this.ballSpeedMultiplier = 1

        this.ballSpeedIncreaseDelay = 7 // how many time we will add something to the mult
        this.ballSpeedIncrease = 0.15 // we add that number every delay rounds to the mult
        this.ballSpeedIncreaseReduce = 0.8 // the number above is multiplied by this number every delay rounds
        
        

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
            ballRadius : this.ballRadius,

            winCondition : this.winCondition
                        
        }
    }

    resetScores(){
        this.scores = {
            0 : 0,
            1 : 0
        }
    }

    resetCountdown(duration){
        this.countdownDuration = duration;
        this.countdownTimer = 0;
        this.startIn = this.countdownDuration / 1000
    }

    spawnBall(){
        this.ball = new Ball(this.screenSize, this.ballStartX, this.ballStartY, this.ballRadius,
        this.ballSpeed, this.ballStartAngle, this.ballStartSpeed, this.ballEffectStrength)
    }

    handleInput(playerId, input) {
        let paddle = this.paddles[playerId];
        if (paddle){
            paddle.move(input)
        }
    }
    resetPaddlesDirection() {
        for(let i = 0; i < this.paddles.length; i++){
            let paddle = this.paddles[i];
            paddle.direction = 0
        }
    }

    detectPoints(){
        var ballX = this.ball.getPos().x;
        var hasToReplay = false;
        if(ballX + this.ballRadius> this.screenSize[0]){
            this.scores[0] ++;
            hasToReplay = true;

            if(this.scores[0] == this.winCondition){
                this.gameEnded = true;
                this.winner = 0
            }
        }
        else if(ballX - this.ballRadius < 0){
            this.scores[1] ++;
            hasToReplay = true;

            if(this.scores[1] == this.winCondition){
                this.gameEnded = true;
                this.winner = 1
            }
        }

        return hasToReplay
    }

    getState() {
        
        for(let i = 0; i < this.paddles.length; i++){
            this.paddlesY[i].y = this.paddles[i].getY();
        }
        
        return {
            paddles: this.paddlesY,
            ball: this.ball.getPos(),
            startIn: this.startIn,
            ballSpeedMultiplier : this.ballSpeedMultiplier.toFixed(2),
            winner : this.winner
        };
    }

    getScores(){
        return this.scores
    }

    getPaddles(){
        return this.paddles;
    }

    getStartInfo(){
        return structuredClone(this.startInfo)
    }


}

module.exports = Game;