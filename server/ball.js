

class Ball{
    constructor(screenSize, radius, speed){

        this.radius = radius
        this.screenSize = screenSize;

        this.x = screenSize[0] / 2 - radius;
        this.y = screenSize[1] / 2 - radius;

        this.speed = speed;

        //same angle with random start direction
        var angle = (Math.PI / 3) * (Math.random() < 0.5 ? -1 : 1);
        this.dirX = Math.cos(angle);
        this.dirY = Math.sin(angle);

    }

    move(deltaTime){
        var potentialX = this.x + (this.dirX * this.speed);
        var potentialY = this.y + (this.dirY * this.speed);

        if(potentialX + this.radius * 2 > this.screenSize[0] || potentialX < 0){
            this.dirX *= -1;
        }
        else{
            this.x = potentialX;
        }
        if(potentialY + this.radius * 2 > this.screenSize[1] || potentialY < 0){
            this.dirY *= -1;
        }
        else{
            this.y = potentialY;
        }
    }



    getPos() {
        return {
            x: this.x,
            y: this.y
        };
    }
}


module.exports = Ball;