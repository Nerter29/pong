let ws = new WebSocket("wss://nerter.fr/pong/");

let player = null;

ws.onmessage = function(event) {
    let data = JSON.parse(event.data);

    if (data.type === "assign") {
        player = data.player;
        console.log("im", player);
    }

    if (data.type === "start") {
        console.log("game started for client !");
    }
};