class Game {
    constructor() {
        this.screenSize = [700, 500]
        this.paddleWidth = 20
        this.paddleHeight = 100
        this.startY = this.screenSize[1] / 2

        this.players = {
            0: { y: this.startY },
            1: { y: this.startY }
        };

        this.startInfo = {
            screenWidth : this.screenSize[0],
            screenHeight : this.screenSize[1],
            players : {
                0 : {startX : 0, startY : this.startY},
                1 : {startX : this.screenSize[0] - this.paddleWidth, startY : this.startY}
            },
            paddleWidth : this.paddleWidth,
            paddleHeight : this.paddleHeight
            
        }

        this.playerSpeed = 1;
    }

    handleInput(playerId, input) {
        let player = this.players[playerId];
        if (!player) return;

        if (input === "up") {
            player.y -= this.playerSpeed;
        }

        if (input === "down") {
            player.y += this.playerSpeed;
        }

        if (player.y < 0) player.y = 0;
        if (player.y > 500) player.y = 500;
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