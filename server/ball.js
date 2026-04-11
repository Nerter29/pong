

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
        for(let i = 0; i < paddles.length; i++){
            var paddle = paddles[i];

            if((this.x > paddle.x && this.x < paddle.x + paddle.width) && 
            (this.y > paddle.y && this.y < paddle.y + paddle.height)){
                var maxAngle = (Math.PI / 3); // we can go from -pi/3 to pi/3 (we will add it of pi at the end, to reverse the bounce)

                var playerCenterX = paddle.x + (paddle.width / 2);

                var ballCenterX = this.x + (this.width / 2);

                var centerDistance = playerCenterX - ballCenterX;
                var normalizedCenterDistance = centerDistance / (paddle.width / 2);

                // if i == 0, we bounce to the right (left paddle), 
                // if i == 1, we add Math.PI so it bounce to the right (left paddle)
                var bounceAngle = normalizedCenterDistance * maxAngle + (Math.PI * i); 
                
                //we reverse the vector and give it to the ball
                this.dirX = (Math.cos(bounceAngle));
                this.dirY =(-Math.sin(bounceAngle));
            }
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