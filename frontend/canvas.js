
export function setUpCanvas(canvas, ctx, screenWidth, screenHeight, windowFilling){
    //this function calculate the ratio of the game, apply it to the canvas based on the size of the window,
    //and set a scale to the canvas based on its size and the game screen size

    //window filling is the proportion of the window filled by the canvas

    const gameRatio = screenWidth / screenHeight

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    var canvasWidth;
    var canvasHeight
    //if the window ratio is bigger than the game ratio, we set up the dimensions of the canvas base on the window height that limits our canvas size
    if(windowWidth / windowHeight > gameRatio){
        canvasHeight = windowHeight;
        canvasWidth = canvasHeight * gameRatio
    } 
    else{
        canvasWidth = windowWidth
        canvasHeight = canvasWidth / gameRatio
    }

    canvas.width = canvasWidth * windowFilling
    canvas.height = canvasHeight * windowFilling

    const scale = canvas.width / screenWidth
    ctx.scale(scale, scale)


}