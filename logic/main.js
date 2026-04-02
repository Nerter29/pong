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

    if (data.type === "input") {
        console.log("input received : ", data);
    }
};

//input
document.addEventListener("keydown", function(event) {
    if (!player){
        return;
    } 

    let input = "";

    if (event.key === "ArrowUp") {
        input = "up";
    }

    if (event.key === "ArrowDown") {
        input = "down";
    }

    if (input) {
        ws.send(JSON.stringify({
            type: "input",
            player: player,
            input: input
        }));
    }
});