const Ball = require("./ball");


class Game {
    constructor() {
        this.screenSize = [700, 500]
        this.paddleWidth = 20
        this.paddleHeight = 100
        this.paddleStartY = this.screenSize[1] / 2 - this.paddleHeight / 2
        this.xSpacing = 10

        this.players = {
            0: { y: this.paddleStartY },
            1: { y: this.paddleStartY }
        };

        this.ballRadius = 4;

        this.ballStartX = this.screenSize[0] / 2 - this.ballRadius
        this.ballStartY = this.screenSize[1] / 2 - this.ballRadius
        this.ballSpeed = 6;
        this.ball = new Ball(this.screenSize, this.ballStartX, this.ballStartY, this.ballRadius, this.ballSpeed)

        this.startInfo = {
            screenWidth : this.screenSize[0],
            screenHeight : this.screenSize[1],
            players : {
                0 : {startX : this.xSpacing, paddleStartY : this.paddleStartY},
                1 : {startX : this.screenSize[0] - this.paddleWidth - this.xSpacing, paddleStartY : this.paddleStartY}
            },
            paddleWidth : this.paddleWidth,
            paddleHeight : this.paddleHeight,

            ballStartX : this.ballStartX,
            ballStartY : this.ballStartY,
            ballRadius : this.ballRadius
            
        }

        this.playerSpeed = 3;
    }

    handleInput(playerId, input) {
        let player = this.players[playerId];
        if (player){
            if (input === "up" && player.y > 0) {
                player.y -= this.playerSpeed;
            }

            if (input === "down" && player.y + this.paddleHeight < this.screenSize[1]) {
                player.y += this.playerSpeed;
            }
        }
    }

    getState() {
        return {
            players: this.players,
            ball: this.ball.getPos()
        };
    }

    getStartInfo(){
        return structuredClone(this.startInfo)
    }
}

module.exports = Game;