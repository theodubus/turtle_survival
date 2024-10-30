import { elapsedTime } from './game.js';
import { player, getScore, getGhostStatus } from './player.js';

// Initialisation du canvas et du contexte de dessin
export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

export function resizeCanvas() {
    canvas.width = Math.min(Math.round(0.95*window.innerWidth), 1000);
    canvas.height = Math.min(Math.round(0.98*window.innerHeight), 600);

    if (player){
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
    }
}

export function getWidth() {
    return canvas.width;
}

export function getHeight() {
    return canvas.height;
}

// Fonction pour dessiner le timer en haut à droite
export function drawTimer() {
    const temps = Math.floor(elapsedTime);
    const secondes = temps % 60;
    const minutes = Math.floor(temps / 60);
    let text;
    let textMin = `${minutes}`;
    let textSec = `${secondes}`;
    if (minutes < 10){
        textMin = `0${minutes}`;
    }
    if (secondes < 10){
        textSec = `0${secondes}`;
    }
    text = `${textMin}:${textSec}`;
    
    const textScore = `Score : ${getScore()}`;
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center"; // Changer l'alignement du texte au centre

    // Mesurer la largeur du texte
    const scoreTextWidth = ctx.measureText(textScore).width;
    const timerTextWidth = ctx.measureText(text).width;

    // Définir les dimensions et la position du rectangle score en haut à droite
    const padding = 10;
    const rectX = canvas.width - scoreTextWidth - 40;
    const rectY = 0;
    const rectWidth = scoreTextWidth + padding * 2;
    const rectHeight = 30;

    // Definir les dimensions et la position du rectangle timer, en haut à gauche 
    const rectX2 = 20;
    const rectY2 = 0;
    const rectWidth2 = timerTextWidth + padding * 2;


    // Dessiner le rectangle de fond
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)"; // Fond blanc semi-transparent
    ctx.fillRect(0, 0, canvas.width, rectHeight);


    // Dessiner le texte par-dessus le rectangle
    ctx.fillStyle = "white";
    ctx.fillText(textScore, rectX + rectWidth / 2, rectY + rectHeight / 2 + 7); // Centrer le texte

    if (getGhostStatus()){
        ctx.fillStyle = "red";
    }
    ctx.fillText(text, rectX2 + rectWidth2 / 2, rectY2 + rectHeight / 2 + 7); // Centrer le texte
    
    // ctx.fillText(textScore, rectX + rectWidth / 2, rectY + rectHeight / 2 + 3 + rectHeight); // Centrer le texte

    
}

// Fonction pour effacer l'écran
export function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}