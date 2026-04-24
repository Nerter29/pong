

class Paddle{
    constructor(screenSize, startX, startY, width, height, speed){

        this.width = width
        this.height = height
        this.screenSize = screenSize;

        this.x = startX;
        this.y = startY;
        this.direction = 0

        this.speed = speed;
    }

    move(input){
        
        if (input === "up" && this.y > 0) {
            this.y -= this.speed;
            this.direction = 1
        }

        if (input === "down" && this.y + this.height < this.screenSize[1]) {
            this.y += this.speed;
            this.direction = -1
        }
    }


    getY() {
        return this.y;
    }
}


module.exports = Paddle;