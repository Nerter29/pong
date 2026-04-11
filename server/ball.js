

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

    collideWithPaddles(paddles){
        //this function handles the collisions between the ball and the paddles so it bounce in a certain direction :
        //the ball will bounce based on the distance with the center of the paddle, if it bounce on the top, it will
        //bounce with a high angle, if it bounce at the center, the ball will bounce horizontally
        for(let i = 0; i < paddles.length; i++){
            var paddle = paddles[i];

            
            if((this.x > paddle.x && this.x < paddle.x + paddle.width) && 
            (this.y > paddle.y && this.y < paddle.y + paddle.height)){

                //we determine the direction : if we check the right or left player, we set a different direction to the bounce
                var direction = 1;
                if(i == 1){
                    direction = -1
                }
                var maxAngle = (Math.PI / 3); // we can go from -pi/3 to pi/3 

                var paddleCenterY = paddle.y + (paddle.height / 2);

                var centerDistance = paddleCenterY - this.y; // ball x is already centered, but not the paddle
                var normalizedCenterDistance = centerDistance / (paddle.height / 2);

                var bounceAngle = (normalizedCenterDistance * maxAngle);
                //we reverse the vector and give it to the ball
                this.dirX = direction * (Math.cos(bounceAngle));
                this.dirY =(-Math.sin(bounceAngle));
            }
        }
    }



    getPos() {
        return {
            x: this.x,
            y: this.y,
        };
    }
}


module.exports = Ball;