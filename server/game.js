class Game {
    constructor() {
        this.screenSize = [700, 500]
        this.paddleWidth = 20
        this.paddleHeight = 100
        this.startY = this.screenSize[1] / 2 - this.paddleHeight / 2
        this.xSpacing = 10

        this.players = {
            0: { y: this.startY },
            1: { y: this.startY }
        };

        this.startInfo = {
            screenWidth : this.screenSize[0],
            screenHeight : this.screenSize[1],
            players : {
                0 : {startX : this.xSpacing, startY : this.startY},
                1 : {startX : this.screenSize[0] - this.paddleWidth - this.xSpacing, startY : this.startY}
            },
            paddleWidth : this.paddleWidth,
            paddleHeight : this.paddleHeight
            
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
            players: this.players
        };
    }

    getStartInfo(){
        return structuredClone(this.startInfo)
    }
}

module.exports = Game;