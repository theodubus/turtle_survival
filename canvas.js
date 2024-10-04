import { elapsedTime } from './game.js';
import { player } from './player.js';

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
    const text = `Temps : ${Math.floor(elapsedTime)}s`;
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center"; // Changer l'alignement du texte au centre

    // Mesurer la largeur du texte
    const textWidth = ctx.measureText(text).width;

    // Définir les dimensions et la position du rectangle
    const padding = 10;
    const rectX = canvas.width - textWidth - 40;
    const rectY = 10;
    const rectWidth = textWidth + padding * 2;
    const rectHeight = 30;

    // Dessiner le rectangle de fond
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Fond blanc semi-transparent
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

    // Dessiner le texte par-dessus le rectangle
    ctx.fillStyle = "black";
    ctx.fillText(text, rectX + rectWidth / 2, rectY + rectHeight / 2 + 7); // Centrer le texte
}

// Fonction pour effacer l'écran
export function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}