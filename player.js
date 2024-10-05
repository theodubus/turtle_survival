import { ctx, getHeight, getWidth } from "./canvas.js";
import { isPhone } from './utils.js';

let speedPlayer = 2
if (isPhone()) {
    speedPlayer = 1; // Vitesse du joueur sur téléphone
}

// Configuration du joueur (toujours au centre)
export let player = {
    x: getWidth() / 2,    // Le joueur reste toujours au centre du canvas
    y: getHeight() / 2,
    radius: 30,             // Taille du cercle
    color: "blue",          // Couleur du personnage
    speed: speedPlayer,                // Vitesse de déplacement
    hp: 10,                   // points de vie
    maxHp: 10,                // points de vie max
    currentImage : 0,        // Image actuelle du joueur
    lastChange: 0,           // Dernier changement d'image
    direction: 'b',      // Dernière direction du joueur
    animationSpeed: 35,     // Vitesse de l'animation
};

// Fonction pour dessiner la barre de vie en haut à gauche
export function drawHealthBar() {
    const barWidth = 200;
    const barHeight = 20;
    const barPadding = 10;
    const barX = barPadding;
    const barY = barPadding;
    const barInnerWidth = (player.hp / player.maxHp) * barWidth;

    // gris foncé
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, barInnerWidth, barHeight);
}

// Directions disponibles
const directions = ['h', 'hg', 'hd', 'b', 'bg', 'bd', 'g', 'd'];
const numImages = 17; // Nombre d'images par direction (de 0 à 16)

// Objet pour stocker les images par direction
const playerImages = {};

// Charger les images pour chaque direction
directions.forEach(direction => {
    playerImages[direction] = []; // Créer un tableau pour chaque direction
    for (let i = 0; i < numImages; i++) {
        const img = new Image();
        img.src = `assets/player/${direction}_${i}.png`; // Nom du fichier d'image
        playerImages[direction].push(img); // Ajouter l'image au tableau de la direction
    }
});

// Fonction pour dessiner le joueur
export function drawPlayer() {
    const scale = player.radius * 2; // Multiplier par 2 pour obtenir le diamètre
    const width = scale;  // Largeur du joueur
    const height = scale; // Hauteur du joueur

    // Dessinez l'image actuelle du joueur
    ctx.drawImage(
        playerImages[player.direction][player.currentImage],
        player.x - width / 2, // Centrer l'image horizontalement
        player.y - height / 2, // Centrer l'image verticalement
        width, // Largeur
        height // Hauteur
    );

    // temps depuis lequel on a changé l'image
    const timeSinceChange = Date.now() - player.lastChange;
    if (timeSinceChange > player.animationSpeed) {
        if (!player.currentImage == 0){
            // Mettez à jour l'index de l'image actuelle, max entre 1 et le resultat 
            player.currentImage = Math.max(1, (player.currentImage + 1) % numImages);
            player.lastChange = Date.now();
        }
    }
}
