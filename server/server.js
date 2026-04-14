const { broadcastInformations } = require("./api.js");
const WebSocket = require("ws");

const wssPort = 3001;
const wss = new WebSocket.Server({ port: wssPort });


const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;

const playerPerRoom = 2;

console.log("pong web socket running");

const Game = require("./game");

var rooms = [];

var lastTime = Date.now()



//----------------------------------API--------------------------------------
// the api is used to communicate the server status to anyone, like the room status, players connected etc.

const apiPort = 3002;
const express = require("express");
const apiServer = express();

broadcastInformations(apiServer, apiPort, rooms)



//------------------------------------Rooms and Players management-----------------------------------------

function getRoomId(){
    //retruns an id, insuring that it is not taken by an other room
    var id = 0
    var idTaken = false;
    var idFound = false
    let i = 0
    while(i < rooms.length && !idFound){
        let j = 0
        idTaken = false;
        while(j < rooms.length && !idTaken){
            if(rooms[j].id == i){
                idTaken = true
            }
            j++
        }
        if(!idTaken){
            idFound = true
            id = i;
        }
        i++;
    }
    if(!idFound){
        id = rooms.length;
    }
    return id
}

function getPlayerId(room){
    //assign an id to a player, insuring that it has not be taken by the other player
    var playerId;

    if (room.players.length === 0) {
        playerId = 0;
    } 
    else {
        if(room.players[0].id === 0){
            playerId = 1;
        }
        else{
            playerId = 0;
        }
    }  
    return playerId
}


function createRoom(wantedId) {
    //creates a default room that will contain an id, a player list, a game and a loop to run the game 
    var verifiedId = wantedId

    //when the player doesn't want any id, we give him an arbitrary one
    if(wantedId == -1){
        verifiedId = getRoomId()
    }
    else{
        //we check if the wanted Id is already taken, if it is, we set a new id
        var idTaken = false
        for(var i = 0; i < rooms.length; i++){
            if(rooms[i].id == wantedId){
                idTaken = true
            }
        }
        if(idTaken){
            verifiedId = getRoomId()
        }
    }
    
    return {
        id : verifiedId,
        players: [],
        game: new Game(),
        loop: null
    };
}

function findRoom(wantedId) {
    //find a room by checking if there is one that is waiting for players, if there is not, creates a new room

    var anyId = false
    if(wantedId == -1){
        anyId = true
    }

    for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].players.length < playerPerRoom) {
            if(wantedId == rooms[i].id || anyId){
                return rooms[i];
            }
        }
    }
    var newRoom = createRoom(wantedId);
    rooms.push(newRoom);
    return newRoom;
}


function sendDataToRoom(room, data, type){
    //send the data with a certain type to all the players of the room
    for (var i = 0; i < room.players.length; i++) {
        room.players[i].socket.send(JSON.stringify({
            type: type,
            data: data
        }));
    }
}



function sendConnectionPackage(ws, room, playerId){
    //send the connection package to the player that joined to tell him is Id
    console.log("player " + playerId + " connected in room " + room.id);
    ws.send(JSON.stringify({
        type: "connected",
        playerId: playerId,
        roomId: room.id
    }));
}

//--------------------------------------------Game-----------------------------------------


function gameLoop(room) {
    var game = room.game
    if(game.startIn == 0){
    
        game.ball.move()
    }
    else{
        game.countdownTimer += Date.now() - lastTime
        lastTime= Date.now()
        game.startIn = Math.round((game.startCountdown - game.countdownTimer) / 1000)
        if(game.countdownTimer > game.startCountdown){
            game.countdownTimer = game.startCountdown
            game.startIn = 0
        }
    }
    
    
    var hasCollided = game.ball.collideWithPaddles(game.getPaddles());
    var hasToReplay = game.detectPoints()
    if(hasToReplay){
        sendDataToRoom(room, game.getScores(), "score")
    }
    if(hasCollided){
        var pos = game.ball.getPos()
        var data = {
            x : pos.x,
            y : pos.y,
            angle : game.ball.bounceAngle,
            direction : game.ball.direction
        }
        sendDataToRoom(room, data, "collision")
    }
    //send the state to every clients
    sendDataToRoom(room, game.getState(), "state")
}

wss.on("connection", function (ws, req) {

    //----------------------------------------------Player Connection-----------------------------------------------
    //check the wanted roomId in the url
    const url = new URL(req.url, "http://localhost");
    const wantedRoomId = url.searchParams.get("room");

    var room = findRoom(parseInt(wantedRoomId));

    var playerId = getPlayerId(room, ws);

    sendConnectionPackage(ws, room, playerId);

    room.players.push({
        id: playerId,
        socket: ws
    });

    //we rember the room and the playerId of this websocket, that will be useful later
    ws.room = room;
    ws.playerId = playerId;

    //start game if we have 2 players
    if (room.players.length === 2) {
        //before starting, starts a countdown 
        sendDataToRoom(room, room.game.getStartInfo(), "start");
        room.game.countdownTimer = 0;
        lastTime = Date.now()
        room.loop = setInterval(function () {
        gameLoop(room);
        }, TICK_INTERVAL);
    }


    //----------------------------------------------Messages Receptions-----------------------------------------------

    ws.on("message", function (message) {
        let messageParsed;

        try {
            messageParsed = JSON.parse(message.toString());
        } catch (e) {
            console.log("json message bad format")
            return;
        }

        if (messageParsed.type === "input") {

            var room = ws.room;
            //handle inputs of clients
            room.game.handleInput(ws.playerId, messageParsed.input);

        }
    });


    //----------------------------------------------Disconnection-----------------------------------------------
    ws.on("close", function () {
        var room = ws.room;

        if (room){
            console.log("player " + ws.playerId + " of room " + ws.room.id + " disconnected");

            // remove player
            for (var i = 0; i < room.players.length; i++) {
                if (room.players[i].socket === ws) {
                    room.players.splice(i, 1);
                    break;
                }
            }

            //when someone disconnect, the entire room is deleted.

            //we stop the loop
            if (room.interval) {
                clearInterval(room.interval);
            }

            //we look for the oppenent
            var oppenent = null;

            for (var i = 0; i < room.players.length; i++) {
                if (room.players[i].socket !== ws) {
                    oppenent = room.players[i].socket;
                }
            }

            //we clear players
            room.players = []

            //we remove the room
            var index = rooms.indexOf(room);
            if (index !== -1) {
                rooms.splice(index, 1);
            }

            //we say to the oppenent to reconnect and we diconnect him
            if(oppenent != null){
                oppenent.send(JSON.stringify({
                    type: "reconnect"
                }));
                oppenent.close();
            }
        }
    });
});


