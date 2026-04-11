

class Paddle{
    constructor(screenSize, startX, startY, width, height, speed){

        this.width = width
        this.height = height
        this.screenSize = screenSize;

        this.x = startX;
        this.y = startY;

        this.speed = speed;
    }

    move(input){
        if (input === "up" && this.y > 0) {
            this.y -= this.speed;
        }

        if (input === "down" && this.y + this.height < this.screenSize[1]) {
            this.y += this.speed;
        }
    }


    getY() {
        return this.y;
    }
}


module.exports = Paddle;