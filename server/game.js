class Game {
    constructor() {
        this.screenSize = [1000, 500]

        this.players = {
            0: { y: this.screenSize[1] / 2 },
            1: { y: this.screenSize[1] / 2 }
        };

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
}

module.exports = Game;