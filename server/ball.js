

class Ball{
    constructor(screenSize, startX, startY, radius, speed){

        this.radius = radius
        this.screenSize = screenSize;

        this.x = startX;
        this.y = startY;

        this.speed = speed;

        //same angle with random start direction
        var angle = (Math.PI / 3) * (Math.random() < 0.5 ? -1 : 1);
        this.dirX = Math.cos(angle);
        this.dirY = Math.sin(angle);

    }

    move(){
        var potentialX = this.x + (this.dirX * this.speed);
        var potentialY = this.y + (this.dirY * this.speed);

        if(potentialX + this.radius > this.screenSize[0] || potentialX < this.radius){
            this.dirX *= -1;
        }
        else{
            this.x = potentialX;
        }
        if(potentialY + this.radius > this.screenSize[1] || potentialY < this.radius){
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