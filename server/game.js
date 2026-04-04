class Game {
    constructor() {
        this.players = {
            1: { y: 50 },
            2: { y: 50 }
        };

        this.speed = 1;
    }

    handleInput(playerId, input) {
        let player = this.players[playerId];
        if (!player) return;

        if (input === "up") {
            player.y -= this.speed;
        }

        if (input === "down") {
            player.y += this.speed;
        }

        if (player.y < 0) player.y = 0;
        if (player.y > 100) player.y = 100;
    }

    getState() {
        return {
            players: this.players
        };
    }
}

module.exports = Game;