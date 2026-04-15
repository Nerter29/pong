
function broadcastInformations(apiServer, apiPort, rooms){

    //so any browser can access the json
    apiServer.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    apiServer.get("/", function (req, res){
        let roomsInfo = {}
        var totalPlayerNum = 0
        for(let i = 0; i < rooms.length; i++){
            var currentRoom = rooms[i]
            roomsInfo[currentRoom.id] = {
                id : currentRoom.id,
                playerNum : currentRoom.players.length
            }
            totalPlayerNum += currentRoom.players.length

        }
        res.json({
            rooms : roomsInfo,
            playersNum : totalPlayerNum
        })
    });

    apiServer.listen(apiPort, function () {
        console.log("API server running on port " + apiPort);
    });

}

module.exports = {
    broadcastInformations
};