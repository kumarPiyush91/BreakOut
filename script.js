// ================= BOARD =================
let board;
let context;
let boardWidth;
let boardHeight;

// ================= PLAYER =================
let playerWidth;
let playerHeight;
let playerSpeed;
let player;

// ================= BALL =================
let ballWidth;
let ballHeight;
let baseBallSpeedX;
let baseBallSpeedY;
let ball;

// ================= BLOCKS =================
let blockArray = [];
let blockColumns = 8;
let blockRows = 3;
let blockWidth;
let blockHeight;
let blockGap;
let blockTopOffset;
let blockCount = 0;
let colors = ["red", "orange", "yellow", "green", "blue", "purple"];

// ================= BUG =================
let bugImage = new Image();
bugImage.src = "bug.png";
let bugWidth;
let bugHeight;
let bugSpeed;
let bug;

// ================= AUDIO =================
let bgMusic = new Audio("game.mp3");
let gameOverSound = new Audio("over.mp3");
bgMusic.preload = "auto";
gameOverSound.preload = "auto";

let musicStarted = false;
let gameOverSoundPlayed = false;

// ================= GAME STATE =================
let score = 0;
let gameOver = false;
let gameWon = false;
let gameStarted = false; 
let level = 1;
let maxLevel = 4;

let keys = { ArrowLeft: false, ArrowRight: false };

// ================= CHECK DEVICE =================
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// ================= RESPONSIVE SIZE =================
function setCanvasSize() {
    boardWidth = Math.min(window.innerWidth - 20, 500);
    boardHeight = Math.min(window.innerHeight - 20, 500);
    board.width = boardWidth;
    board.height = boardHeight;

    playerWidth = boardWidth * 0.18;
    playerHeight = boardHeight * 0.025;
    playerSpeed = boardWidth * 0.02;

    ballWidth = boardWidth * 0.025;
    ballHeight = ballWidth;

    // Speed Logic: Mobile pe aadhi (0.5x)
    let speedMultiplier = isMobile ? 0.004 : 0.008; 
    baseBallSpeedX = boardWidth * speedMultiplier;
    baseBallSpeedY = boardHeight * speedMultiplier;

    blockWidth = boardWidth * 0.1;
    blockHeight = boardHeight * 0.03;
    blockGap = boardWidth * 0.02;
    blockTopOffset = boardHeight * 0.1;

    bugWidth = boardWidth * 0.07;
    bugHeight = bugWidth;
    bugSpeed = boardHeight * (isMobile ? 0.0025 : 0.005);
}

// ================= AUDIO UNLOCK =================
function handleUserInteraction() {
    if (!gameStarted) {
        gameStarted = true;
        // Background Music Start
        bgMusic.loop = true;
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            musicStarted = true;
        }).catch(err => console.log("Audio Error:", err));
        
        // Mobile par audio context wake up karne ke liye
        gameOverSound.play().then(() => {
            gameOverSound.pause();
            gameOverSound.currentTime = 0;
        }).catch(() => {});
    }
}

window.onload = function () {
    board = document.getElementById("board");
    context = board.getContext("2d");

    setCanvasSize();
    initGame();

    window.addEventListener("resize", () => { setCanvasSize(); setupLevel(); });

    requestAnimationFrame(update);

    // Desktop Controls
    document.addEventListener("keydown", (e) => {
        handleUserInteraction();
        if (e.code === "ArrowLeft") keys.ArrowLeft = true;
        if (e.code === "ArrowRight") keys.ArrowRight = true;
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft") keys.ArrowLeft = false;
        if (e.code === "ArrowRight") keys.ArrowRight = false;
    });

    // Mobile/Tablet Controls
    board.addEventListener("touchstart", (e) => {
        handleUserInteraction();
        movePaddleTouch(e);
    }, { passive: false });

    board.addEventListener("touchmove", movePaddleTouch, { passive: false });
    board.addEventListener("mousedown", handleUserInteraction);
};

function movePaddleTouch(e) {
    e.preventDefault();
    let rect = board.getBoundingClientRect();
    let touchX = e.touches[0].clientX - rect.left;
    player.x = touchX - player.width / 2;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > boardWidth) player.x = boardWidth - player.width;
}

function initGame() {
    gameOver = false;
    gameWon = false;
    score = 0;
    level = 1;
    gameOverSoundPlayed = false;
    setupLevel();
}

function setupLevel() {
    blockRows = 2 + level;
    player = {
        x: boardWidth / 2 - playerWidth / 2,
        y: boardHeight - playerHeight - 15,
        width: playerWidth,
        height: playerHeight
    };
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: baseBallSpeedX + (level - 1) * 0.5,
        velocityY: baseBallSpeedY + (level - 1) * 0.5
    };
    bug = { x: Math.random() * (boardWidth - bugWidth), y: -bugHeight, width: bugWidth, height: bugHeight };
    createBlocks();
}

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, boardWidth, boardHeight);

    if (!gameStarted) {
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "24px sans-serif";
        context.fillText("CLICK / TAP TO START", boardWidth / 2, boardHeight / 2);
        context.font = "16px sans-serif";
        context.fillText("Music will play automatically", boardWidth / 2, boardHeight / 2 + 40);
        return;
    }

    if (gameOver || gameWon) {
        bgMusic.pause();
        if (gameOver && !gameOverSoundPlayed) {
            gameOverSound.play();
            gameOverSoundPlayed = true;
        }
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "22px sans-serif";
        context.fillText(gameOver ? "Game Over" : "🎉 WINNER! 🎉", boardWidth / 2, boardHeight / 2);
        context.font = "16px sans-serif";
        context.fillText("Refresh to Play Again", boardWidth / 2, boardHeight / 2 + 35);
        return;
    }

    // Logic
    if (keys.ArrowLeft) player.x -= playerSpeed;
    if (keys.ArrowRight) player.x += playerSpeed;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > boardWidth) player.x = boardWidth - player.width;

    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillStyle = "white";
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    if (detectCollision(ball, player)) ball.velocityY *= -1;
    if (ball.y <= 0) ball.velocityY *= -1;
    if (ball.x <= 0 || ball.x + ball.width >= boardWidth) ball.velocityX *= -1;
    if (ball.y + ball.height >= boardHeight) gameOver = true;

    for (let block of blockArray) {
        if (!block.break) {
            context.fillStyle = block.color;
            context.fillRect(block.x, block.y, block.width, block.height);
            if (detectCollision(ball, block)) {
                block.break = true;
                ball.velocityY *= -1;
                score += 100;
                blockCount--;
            }
        }
    }

    if (blockCount === 0) {
        if (level < maxLevel) { level++; setupLevel(); } else { gameWon = true; }
    }

    bug.y += bugSpeed;
    context.drawImage(bugImage, bug.x, bug.y, bug.width, bug.height);
    if (detectCollision(bug, player)) gameOver = true;
    if (bug.y > boardHeight) { bug.x = Math.random() * (boardWidth - bugWidth); bug.y = -bugHeight; }

    context.fillStyle = "white";
    context.textAlign = "left";
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 10, 20);
    context.fillText("Level: " + level, 10, 40);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function createBlocks() {
    blockArray = [];
    let totalWidth = blockColumns * blockWidth + (blockColumns - 1) * blockGap;
    let startX = (boardWidth - totalWidth) / 2;
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            blockArray.push({
                x: startX + c * (blockWidth + blockGap),
                y: blockTopOffset + r * (blockHeight + blockGap),
                width: blockWidth, height: blockHeight,
                break: false, color: colors[r % colors.length]
            });
        }
    }
    blockCount = blockArray.length;
}