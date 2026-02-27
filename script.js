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
let bugWidth, bugHeight, bugSpeed, bug;

// ================= AUDIO =================
// game.mp3 yahan se hata diya gaya hai
const gameOverSound = new Audio("over.mp3");
const brickSound = new Audio("beep.mp3");

gameOverSound.volume = 0.9;
brickSound.volume = 0.6;

let audioUnlocked = false;
let gameOverSoundPlayed = false;

// ================= GAME STATE =================
let score = 0;
let gameOver = false;
let gameWon = false;
let gameStarted = false;
let level = 1;
let maxLevel = 4;

let keys = { ArrowLeft: false, ArrowRight: false };

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// ================= RESPONSIVE SIZE =================
function setCanvasSize() {
    boardWidth = Math.min(window.innerWidth - 20, 500);
    boardHeight = Math.min(window.innerHeight - 20, 500);
    board.width = boardWidth;
    board.height = boardHeight;

    playerWidth = boardWidth * 0.18;
    playerHeight = boardHeight * 0.025;
    playerSpeed = boardWidth * 0.025;

    ballWidth = boardWidth * 0.025;
    ballHeight = ballWidth;

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
function unlockAudio() {
    if (audioUnlocked) return;

    // Sirf SFX ko pre-unlock karenge mobile lag kam karne ke liye
    [brickSound, gameOverSound].forEach(snd => {
        snd.play()
            .then(() => { snd.pause(); snd.currentTime = 0; })
            .catch(() => {});
    });
    audioUnlocked = true;
}

// ================= INIT =================
window.onload = function () {
    board = document.getElementById("board");
    context = board.getContext("2d");

    setCanvasSize();
    initGame();

    window.addEventListener("resize", () => {
        setCanvasSize();
        setupLevel();
    });

    const handleUserInteraction = () => {
        if (!gameStarted) {
            gameStarted = true;
            unlockAudio();
        }
    };

    document.addEventListener("keydown", (e) => {
        handleUserInteraction();
        if (e.code === "ArrowLeft") keys.ArrowLeft = true;
        if (e.code === "ArrowRight") keys.ArrowRight = true;
    });

    document.addEventListener("keyup", (e) => {
        if (e.code === "ArrowLeft") keys.ArrowLeft = false;
        if (e.code === "ArrowRight") keys.ArrowRight = false;
    });

    board.addEventListener("touchstart", (e) => {
        handleUserInteraction();
        movePaddleTouch(e);
    }, { passive: false });

    board.addEventListener("touchmove", movePaddleTouch, { passive: false });
    document.addEventListener("click", handleUserInteraction, { once: true });

    requestAnimationFrame(update);
};

function movePaddleTouch(e) {
    e.preventDefault();
    const rect = board.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    player.x = touchX - player.width / 2;
    player.x = Math.max(0, Math.min(boardWidth - player.width, player.x));
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
        velocityX: baseBallSpeedX + (level - 1) * 0.4,
        velocityY: baseBallSpeedY + (level - 1) * 0.4
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

    if (!gameStarted) {
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "24px sans-serif";
        context.fillText("Press arrow key to Play", boardWidth / 2, boardHeight / 2);
        return;
    }

    if (gameOver || gameWon) {
        if (gameOver && !gameOverSoundPlayed) {
            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(() => {});
            gameOverSoundPlayed = true;
        }

        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = "22px sans-serif";
        context.fillText(gameOver ? "GAME OVER" : "🎉 YOU WON! 🎉", boardWidth / 2, boardHeight / 2);
        context.font = "16px sans-serif";
        context.fillText("Refresh Page to Play", boardWidth / 2, boardHeight / 2 + 40);
        return;
    }

    if (keys.ArrowLeft) player.x -= playerSpeed;
    if (keys.ArrowRight) player.x += playerSpeed;
    player.x = Math.max(0, Math.min(boardWidth - player.width, player.x));

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
                brickSound.currentTime = 0;
                brickSound.play().catch(() => {});
            }
        }
    }

    if (blockCount === 0) {
        if (level < maxLevel) {
            level++;
            setupLevel();
        } else {
            gameWon = true;
        }
    }

    bug.y += bugSpeed;
    context.drawImage(bugImage, bug.x, bug.y, bug.width, bug.height);

    if (detectCollision(bug, player)) gameOver = true;
    if (bug.y > boardHeight) {
        bug.x = Math.random() * (boardWidth - bugWidth);
        bug.y = -bugHeight;
    }

    context.fillStyle = "white";
    context.textAlign = "left";
    context.font = "16px sans-serif";
    context.fillText("Score: " + score, 10, 20);
    context.fillText("Level: " + level, 10, 40);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function createBlocks() {
    blockArray = [];
    const totalWidth = blockColumns * blockWidth + (blockColumns - 1) * blockGap;
    const startX = (boardWidth - totalWidth) / 2;

    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            blockArray.push({
                x: startX + c * (blockWidth + blockGap),
                y: blockTopOffset + r * (blockHeight + blockGap),
                width: blockWidth,
                height: blockHeight,
                break: false,
                color: colors[r % colors.length]
            });
        }
    }
    blockCount = blockArray.length;
}