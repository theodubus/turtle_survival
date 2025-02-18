import { ctx, canvas, getHeight, getWidth } from "./canvas.js";
import { addDeltaTimeDifficulty, getStage } from "./game.js";
import { getSettings } from "./settings.js";
import { drawRoundedRect, isInsideRect } from "./utils.js";

let lastCheck;
let tolerance = 2000;
let paused = false;
let timePause = 0;


let menuRect = {
    x: 11*getWidth() / 80,
    y: 2*getHeight()/3,
    width: getWidth()/3,
    height: 60,
    isHovered: false
}

let resumeRect = {
    x: (69*getWidth() / 80) - (getWidth()/3),
    y: 2*getHeight()/3,
    width: getWidth()/3,
    height: 60,
    isHovered: false
}

let pauseRect = {
    x: getWidth() - 80,
    y: 0,
    width: 80,
    height: 30,
    isHovered: false
}


export function checkQuit(){
    if (!lastCheck){
        lastCheck = Date.now();
    }
    
    let delta = Date.now() - lastCheck;

    // No check for a certain time, the game has been paused
    if (delta > tolerance){
        pauseGame();
        addDeltaTimeDifficulty(delta);
    }

    lastCheck = Date.now();
}

export function checkPause(){
    if (paused){
        return true;
    }
    return false;
}

export function pauseGame(){
    paused = true;
    timePause = Date.now();
}

export function unpauseGame(){
    paused = false;
    addDeltaTimeDifficulty((Date.now()-timePause));
    lastCheck = Date.now();
}

export function drawPause() {
    const rectHeight = 30;
    const padding = 10;
    const barWidth = 5;
    const barHeight = 20;

    // Coordonnées du rectangle du bouton de pause
    const rectX = getWidth() - barWidth * 4 - 40; // Ajuste pour bien placer le bouton
    const rectY = 3;

    // Couleur des barres : rouge si en hover, sinon noir
    ctx.fillStyle = pauseRect.isHovered ? "rgb(230, 0, 0)" : "rgb(250, 240, 230)";

    // Dessin des deux barres pour le symbole de pause
    ctx.fillRect(rectX + padding, rectY + (rectHeight - barHeight) / 2, barWidth, barHeight);
    ctx.fillRect(rectX + padding + barWidth * 2, rectY + (rectHeight - barHeight) / 2, barWidth, barHeight);

    // Gestion de l'affichage de l'écran de pause
    if (!paused) return;

    // Écran de pause
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, getWidth(), getHeight());
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game paused", getWidth() / 2, (1 * getHeight()) / 3);


    ctx.fillStyle = menuRect.isHovered ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.5)";
    drawRoundedRect(ctx, menuRect.x, menuRect.y, menuRect.width, menuRect.height, 10); // rayon de 10 pour arrondir les bords
    ctx.fill();

    ctx.font = "25px Arial";
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Menu", menuRect.x + menuRect.width / 2, menuRect.y + menuRect.height / 2);

    // Bouton Resume
    ctx.fillStyle = resumeRect.isHovered ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.5)";
    drawRoundedRect(ctx, resumeRect.x, resumeRect.y, resumeRect.width, resumeRect.height, 10); // rayon de 10 pour arrondir les bords
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillText("Resume", resumeRect.x + resumeRect.width / 2, resumeRect.y + resumeRect.height / 2);
}


canvas.addEventListener("mousemove", (event) => {
    const rectCanvas = canvas.getBoundingClientRect();
    const x = event.clientX - rectCanvas.left;
    const y = event.clientY - rectCanvas.top;

    // Vérifie si la souris est dans le rectangle
    const hoverStateResume = isInsideRect(x, y, resumeRect);
    const hoverStateMenu = isInsideRect(x, y, menuRect);
    const hoverStatePause = isInsideRect(x, y, pauseRect);

    // Met à jour l'état `isHovered` et redessine si l'état change
    if (hoverStateResume !== resumeRect.isHovered && paused && getStage()=="game") {
        resumeRect.isHovered = hoverStateResume;
    }

    if (hoverStateMenu !== menuRect.isHovered && paused && getStage()=="game") {
        menuRect.isHovered = hoverStateMenu;
    }

    if (hoverStatePause !== pauseRect.isHovered && getStage()=="game") {
        if (!paused || !hoverStatePause){
            pauseRect.isHovered = hoverStatePause;
        }
    }
});

canvas.addEventListener("click", (event) => {
    const rectCanvas = canvas.getBoundingClientRect();
    const x = event.clientX - rectCanvas.left;
    const y = event.clientY - rectCanvas.top;

    if (isInsideRect(x, y, resumeRect) && paused && getStage()=="game") {
        unpauseGame();
    }

    if (isInsideRect(x, y, menuRect) && paused && getStage()=="game") {
        location.reload();
    }

    if (isInsideRect(x, y, pauseRect) && !paused && getStage()=="game") {
        pauseGame();
    }
});