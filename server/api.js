
export function broadcastInformations(apiServer, apiPort, rooms){

    apiServer.get("/api", function (req, res){
        let roomsInfo = []
        for(let i = 0; i < rooms.length; i++){
            var currentRoom = rooms[i]
            roomsInfo.push({
                id : currentRoom.id,
                players : currentRoom.players
            })

        }
        res.json(roomsInfo)
    });

    apiServer.listen(apiPort, function () {
    console.log("API server running on port " + apiPort);
});

}