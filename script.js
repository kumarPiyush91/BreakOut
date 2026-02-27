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

// Mobile optimization: pre-load audio
bgMusic.preload = "auto";
gameOverSound.preload = "auto";

let musicStarted = false;
let gameOverSoundPlayed = false;

// ================= GAME STATE =================
let score = 0;
let gameOver = false;
let gameWon = false;
let gameStarted = false; // Naya variable game control ke liye
let level = 1;
let maxLevel = 4;

let keys = {
    ArrowLeft: false,
    ArrowRight: false
};

// ================= AUDIO TRIGGER =================
function startMusic() {
    if (!musicStarted) {
        bgMusic.loop = true;
        bgMusic.volume = 0.5;
        bgMusic.play()
            .then(() => { musicStarted = true; })
            .catch(err => console.log("Audio unlock failed:", err));
    }
}

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

    baseBallSpeedX = boardWidth * 0.008;
    baseBallSpeedY = boardHeight * 0.008;

    blockWidth = boardWidth * 0.1;
    blockHeight = boardHeight * 0.03;
    blockGap = boardWidth * 0.02;
    blockTopOffset = boardHeight * 0.1;

    bugWidth = boardWidth * 0.07;
    bugHeight = bugWidth;
    bugSpeed = boardHeight * 0.005;
}

// ================= INIT =================
window.onload = function () {
    board = document.getElementById("board");
    context = board.getContext("2d");

    setCanvasSize();
    initGame();

    window.addEventListener("resize", function () {
        setCanvasSize();
        if(gameStarted) setupLevel(); 
    });

    requestAnimationFrame(update);

    // ===== INPUT CONTROLS =====
    document.addEventListener("keydown", (e) => {
        if (!gameStarted) { gameStarted = true; startMusic(); }
        if (e.code === "ArrowLeft") keys.ArrowLeft = true;
        if (e.code === "ArrowRight") keys.ArrowRight = true;
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft") keys.ArrowLeft = false;
        if (e.code === "ArrowRight") keys.ArrowRight = false;
    });

    // Mobile Touch
    function handleTouch(e) {
        e.preventDefault();
        if (!gameStarted) { gameStarted = true; startMusic(); }
        
        let rect = board.getBoundingClientRect();
        let touchX = e.touches[0].clientX - rect.left;
        player.x = touchX - player.width / 2;
        
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > boardWidth) player.x = boardWidth - player.width;
    }

    board.addEventListener("touchstart", handleTouch, { passive: false });
    board.addEventListener("touchmove", handleTouch, { passive: false });
    board.addEventListener("click", () => { if(!gameStarted) { gameStarted = true; startMusic(); } });
};

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
    bug = {
        x: Math.random() * (boardWidth - bugWidth),
        y: -bugHeight,
        width: bugWidth,
        height: bugHeight
    };
    createBlocks();
}

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, boardWidth, boardHeight);

    // ===== START SCREEN (Mobile compatibility) =====
    if (!gameStarted) {
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "20px sans-serif";
        context.fillText("Tap or Press Any Key to Start", boardWidth / 2, boardHeight / 2);
        context.font = "14px sans-serif";
        context.fillText("Music will play on start", boardWidth / 2, boardHeight / 2 + 30);
        return;
    }

    // ===== GAME OVER / WIN =====
    if (gameOver || gameWon) {
        bgMusic.pause();
        bgMusic.currentTime = 0;

        if (gameOver && !gameOverSoundPlayed) {
            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(e => console.log(e));
            gameOverSoundPlayed = true;
        }

        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "22px sans-serif";
        context.fillText(gameOver ? "Game Over" : "🎉 You Won! 🎉", boardWidth / 2, boardHeight / 2);
        context.font = "16px sans-serif";
        context.fillText("Refresh Page to Restart", boardWidth / 2, boardHeight / 2 + 30);
        return;
    }

    // ===== PLAYER =====
    if (keys.ArrowLeft) player.x -= playerSpeed;
    if (keys.ArrowRight) player.x += playerSpeed;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > boardWidth) player.x = boardWidth - player.width;

    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // ===== BALL =====
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillStyle = "white";
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    if (detectCollision(ball, player)) ball.velocityY *= -1;
    if (ball.y <= 0) ball.velocityY *= -1;
    if (ball.x <= 0 || ball.x + ball.width >= boardWidth) ball.velocityX *= -1;
    if (ball.y + ball.height >= boardHeight) gameOver = true;

    // ===== BLOCKS =====
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

    // ===== BUG =====
    bug.y += bugSpeed;
    context.drawImage(bugImage, bug.x, bug.y, bug.width, bug.height);
    if (detectCollision(bug, player)) gameOver = true;
    if (bug.y > boardHeight) {
        bug.x = Math.random() * (boardWidth - bugWidth);
        bug.y = -bugHeight;
    }

    // HUD
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