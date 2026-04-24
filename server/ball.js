

class Ball{
    constructor(screenSize, startX, startY, radius, speed, startAngle, startSpeed, effectStrength){

        this.radius = radius
        this.screenSize = screenSize;

        this.x = startX;
        this.y = startY;

        this.startSpeed = startSpeed

        this.speed = speed;

        //same angle with random start direction
        var direction = Math.random() < 0.5 ? -1 : 1; // random between -1 and 1 logic (-1 or 1)
        var angle = (startAngle) * (Math.random() * 2 - 1); //random between -1 and 1, analogic (spectrum of values)
        this.dirX = direction * Math.cos(angle);
        this.dirY = Math.sin(angle);

        this.verticalEffect = 0;
        this.effectStrength = effectStrength

        this.bounceAngle = 0
        this.direction = 1;

        this.bounceCounter = 0
        this.firstBounce = true; //is it the ball first bounce or not, used to apply a different speed to the first throw of the ball 
    }

    move(speedMultiplier){
        //this function moves the ball and handle the collisions with the walls, if it collide with it, it retruns it.
        var hasCollided = false
        var currentSpeed = this.speed
        if(this.firstBounce){
            currentSpeed = this.startSpeed;
        }

        //apply the effect
        this.dirY += this.verticalEffect * this.effectStrength

        this.x = this.x + (this.dirX * currentSpeed * speedMultiplier);

        var potentialY = this.y + (this.dirY * currentSpeed);
        if(potentialY + this.radius > this.screenSize[1] || potentialY < this.radius){
            //get the bounce angle from dirX and dirY
            this.bounceAngle = Math.atan2(this.dirY, this.dirX)
            this.direction = 1
            this.dirY *= -1;
            hasCollided = true
        }
        else{
            this.y = potentialY;
        }

        //console.log(this.dirX, this.dirY)
        return hasCollided
    }

    collideWithPaddles(paddles){
        //this function handles the collisions between the ball and the paddles so it bounce in a certain direction :
        //the ball will bounce based on the distance with the center of the paddle, if it bounce on the top, it will
        //bounce with a high angle, if it bounce at the center, the ball will bounce horizontally

        //the function returns if a paddle collision has happend or not.
        var hasCollided = false;
        for(let i = 0; i < paddles.length; i++){
            var paddle = paddles[i];

            
            if((this.x + this.radius > paddle.x && this.x - this.radius < paddle.x + paddle.width) && 
            (this.y + this.radius > paddle.y && this.y  - this.radius< paddle.y + paddle.height)){
                this.bounceCounter ++;
                hasCollided = true;
                if(this.firstBounce){
                    this.firstBounce = false;
                }

                //we determine the direction : if we check the right or left player, we set a different direction to the bounce
                this.direction = 1;
                if(i == 1){
                    this.direction = -1
                }
                var maxAngle = (Math.PI / 3); // we can go from -pi/3 to pi/3 

                var paddleCenterY = paddle.y + (paddle.height / 2);

                var centerDistance = paddleCenterY - this.y; // ball x is already centered, but not the paddle
                var normalizedCenterDistance = centerDistance / (paddle.height / 2);

                this.bounceAngle = (normalizedCenterDistance * maxAngle);
                //we reverse the vector and give it to the ball
                this.dirX = this.direction * (Math.cos(this.bounceAngle));
                this.dirY =(-Math.sin(this.bounceAngle));

                //the effect of the ball is relative to the direction of the paddle when it hits the ball
                this.verticalEffect = paddle.direction
            }
        }

        return hasCollided
    }



    getPos() {
        return {
            x: this.x,
            y: this.y,
        };
    }
}


module.exports = Ball;