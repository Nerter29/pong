let ws = new WebSocket("wss://nerter.fr/pong/");

ws.onopen = function() {
    console.log("Connecté au serveur");

    ws.send("Bonjour serveur !");
};

ws.onmessage = function(event) {
    console.log("Message du serveur:", event.data);
};

ws.onclose = function() {
    console.log("Déconnecté");
};