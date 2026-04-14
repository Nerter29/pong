
function broadcastInformations(apiServer, apiPort, rooms){

    //so any browser can access the json
    apiServer.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    apiServer.get("/", function (req, res){
        let roomsInfo = []
        for(let i = 0; i < rooms.length; i++){
            var currentRoom = rooms[i]
            roomsInfo.push({
                id : currentRoom.id,
                players : currentRoom.players
            })

        }
        res.json(roomsInfo)
        console.log("api hit")
    });

    apiServer.listen(apiPort, function () {
        console.log("API server running on port " + apiPort);
    });

}

module.exports = {
    broadcastInformations
};