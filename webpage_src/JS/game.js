

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//ball position vars
var ballStartingX = canvas.width/2;
var ballStartingY = canvas.height - 30;
var ballX = ballStartingX;
var ballY = ballStartingY;
var ballStartingdx = 2;
var ballStartingdy = -2;
var balldx = ballStartingdx;
var balldy = ballStartingdy;
var ballRadius = 5;

//paddle vars
var paddleHeight = 10;
var paddleWidth = 70;
var paddleX = (canvas.width-paddleWidth)/2;
var paddleSpeed = 7;

//brick array vars
var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

var bricks = [];
for (c = 0; c < brickColumnCount; c++){
  bricks[c] = [];
  for (r = 0; r < brickRowCount; r++) {
    bricks[c][r] = {x:0, y:0, status:1};
  }
}

//score tracking and winning
var score = 0;
var winningScore = brickColumnCount*brickRowCount;
var lives = 5;



//set up player controls
var rightPressed=  false;
var leftPressed = false;

//event listenters
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

document.addEventListener("mousemove", mouseMoveHandler, false);

//listeners will call these:
function keyDownHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = true;
  }
  else if (e.keyCode == 37) {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.keyCode == 39) {
    rightPressed = false;
  }
  else if (e.keyCode == 37) {
    leftPressed = false;
  }
}

function mouseMoveHandler(e){
  var relativeX = e.clientX - canvas.offsetLeft;
  if(relativeX > 0 && relativeX < canvas.width) {
    if(relativeX < paddleWidth/2){
      paddleX = 0;
    }
    else if (relativeX > canvas.width - paddleWidth/2){
      paddleX = canvas.width - paddleWidth;
    }
    else {
      paddleX = relativeX - paddleWidth/2;
    }
  }
}


///////////////////////
//  DRAW FUNCTIONS
///////////////////////


//only draws the blue moving ball
function drawBall(){
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI*2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

//draws the paddle
function drawPaddle(){
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0065DD";
  ctx.fill();
  ctx.closePath();
}

//draws the score
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

//draw lives
function drawLives(){
  ctx.font = "16px Arial";
  ctx.fillStyle = "#999999";
  ctx.fillText("Lives: " + lives, canvas.width-65, 20);
}

//draws the bricks
function drawBricks(){
  var brickX;
  var brickY;

  for (c = 0; c < brickColumnCount; c++){
    for (r = 0; r < brickRowCount; r++){
      brickX = brickOffsetLeft + c*(brickWidth + brickPadding);
      brickY = brickOffsetTop + r*(brickHeight + brickPadding);

      bricks[c][r].x = brickX;
      bricks[c][r].y = brickY;

      if (bricks[c][r].status == 1){
        ctx.beginPath();
        ctx.rect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight);
        ctx.fillStyle = "#FF9555";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

//gotta check dat collision yo
function collisionDetection(){
  //loop through all bricks and ask "is the ball inside me?" degree degree
  for (c = 0; c < brickColumnCount; c++){
    for (r = 0; r < brickRowCount; r++){
      var b = bricks[c][r];
      if (b.status == 1){
        // is senpai inside me? :#S
        var withinX = ballX > b.x && ballX < b.x + brickWidth;
        var withinY = ballY > b.y && ballY < b.y + brickHeight;
        if (withinX && withinY) {
          //reverse direction of ball
          balldy = -balldy;
          //make brick DISSAPEAR. like magic.
          b.status = 0;
          score++;
          if (score == winningScore){
            alert("YOU WIN!\nCONGRATULATIONS!");
            document.location.reload();
          }
        }
      }
    }
  }
}





///////////////////////////////////////////////////////////
//  THE SUPER FUNCTION (game loop)
///////////////////////////////////////////////////////////

function draw() {
  //drawing code
  ctx.clearRect (0, 0, canvas.width, canvas.height);

  drawBricks();


  drawBall();

  //check for bounding box hit
  if (ballY+balldy-ballRadius < 0){
    balldy = -balldy;
  }
  else if (ballY+balldy+ballRadius > canvas.height - paddleHeight) {
    //check for game over state, ball is below paddle
    if (ballX > paddleX && ballX < paddleX + paddleWidth){
      if (balldy > 0)
        balldy = -balldy;
    }
    else if (ballY+balldy+ballRadius > canvas.height){
      //lose life, ball is touching bottom of screen
      if (lives > 1){
        lives--;
        ballX = ballStartingX;
        ballY = ballStartingY;
        balldx = ballStartingdx;
        balldy = ballStartingdy;
      }
      else{
        alert("GAME OVER");
        document.location.reload();
      }
    }

  }

  if (ballX+balldx-ballRadius < 0 || ballX+balldx+ballRadius > canvas.width){
    balldx = -balldx;
  }

  //then actually update the ball's next position
  ballX += balldx;
  ballY += balldy;

  collisionDetection();

  drawScore();
  drawLives();

  drawPaddle();

  //update paddle next position based on keys held
  if (leftPressed){
    if (paddleX - paddleSpeed < 0){
      paddleX = 0;
    }
    else {
      paddleX -= paddleSpeed;
    }
  }
  else if (rightPressed) {
    if (paddleX + paddleSpeed > canvas.width - paddleWidth){
      paddleX = canvas.width - paddleWidth;
    }
    else {
      paddleX += paddleSpeed;
    }
  }

  requestAnimationFrame(draw);
}


draw();
