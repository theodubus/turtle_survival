import { ctx, canvas, getHeight, getWidth } from "./canvas.js";
import { isPhone, getScale } from './utils.js';
import { elapsedTime } from './game.js';

let speedPlayer = 2
if (isPhone()) {
    speedPlayer = 1.1; // Vitesse du joueur sur téléphone
}

// Configuration du joueur (toujours au centre)
export let player = {
    x: getWidth() / 2,    // Le joueur reste toujours au centre du canvas
    y: getHeight() / 2,
    radius: 30 * getScale(),             // Taille du cercle
    color: "blue",          // Couleur du personnage
    speed: speedPlayer,                // Vitesse de déplacement
    hp: 10,                   // points de vie
    maxHp: 10,                // points de vie max
    currentImage : 0,        // Image actuelle du joueur
    lastChange: 0,           // Dernier changement d'image
    direction: 'b',      // Dernière direction du joueur
    animationSpeed: 35,     // Vitesse de l'animation
    baseAnimationSpeed : 35,
    bouleAnimationSpeed : 70,
    eating : false,
    pendingHp : 0,
    InvincibleUntil : 0,
    enemyKillCount: 0,
};

// Fonction pour dessiner la barre de vie en haut à gauche
export function drawHealthBar() {
    if (player.InvincibleUntil < Date.now()){
    let barWidth = player.radius*1.1;
    const barHeight = 5;
    const barPadding = 3;
    const barX = player.x - barWidth / 2;
    const barY = player.y + player.radius + barHeight + barPadding;
    const barInnerWidth = (player.hp / player.maxHp) * barWidth;

    // gris foncé
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    if(player.hp > 0){
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.fillRect(barX, barY, barInnerWidth, barHeight);
    }
    }
}

// Fonction pour dessiner la barre de vie en haut à gauche
export function drawInvincibilityBar() {
    if (player.InvincibleUntil > Date.now()){
        let barWidth = player.radius * 1.1;
        const barHeight = 5;
        const barPadding = 3;
        const barX = player.x - barWidth / 2;
        const barY = player.y + player.radius + barHeight + barPadding;
        const timeRemaining = player.InvincibleUntil - Date.now();
        const barInnerWidth = (timeRemaining / 10000) * barWidth;

        // gris foncé
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = "rgb(102, 0, 255)";
        ctx.fillRect(barX, barY, barInnerWidth, barHeight);
    }
}

// Directions disponibles
const directions = ['h', 'hg', 'hd', 'b', 'bg', 'bd', 'g', 'd'];
const numImages = 17; // Nombre d'images par direction (de 0 à 16)
const numFoodImages = 19; // Nombre d'images pour manger (de 1 à 19)
const numBouleImages = 6;

// Objet pour stocker les images par direction
const playerImages = {};
const bouleImages = {};
const eatingImages = [];

// Charger les images pour chaque direction
directions.forEach(direction => {
    playerImages[direction] = []; // Créer un tableau pour chaque direction
    bouleImages[direction] = []; // Créer un tableau pour chaque direction
    for (let i = 0; i < numImages; i++) {
        const img = new Image();
        img.src = `assets/player/${direction}_${i}.png`; // Nom du fichier d'image
        playerImages[direction].push(img); // Ajouter l'image au tableau de la direction

        if (i < numBouleImages){
            const imgBoule = new Image();
            imgBoule.src = `assets/boule/boule_${direction}_${i+1}.png`; // Nom du fichier d'image
            bouleImages[direction].push(imgBoule); // Ajouter l'image au tableau de la direction
        }
    }
});

// Charger les images de food
for (let i = 1; i < numFoodImages + 1; i++) {
    const img = new Image();
    img.src = `assets/eat_food/${i}.png`; // Nom du fichier d'image
    eatingImages.push(img); // Ajouter l'image au tableau de la direction
}


// Fonction pour dessiner le joueur
export function drawPlayer() {
    const scale = player.radius * 2; // Multiplier par 2 pour obtenir le diamètre
    const width = scale;  // Largeur du joueur
    const height = scale; // Hauteur du joueur

    let imageDisplay;

    if (player.eating){
        imageDisplay = eatingImages[player.currentImage];
    }
    else if (player.InvincibleUntil > Date.now()){
        imageDisplay = bouleImages[player.direction][player.currentImage];
    }
    else{
        imageDisplay = playerImages[player.direction][player.currentImage];
    }

    // Dessinez l'image actuelle du joueur
    ctx.drawImage(
        imageDisplay, // Image à dessiner
        player.x - width / 2, // Centrer l'image horizontalement
        player.y - height / 2, // Centrer l'image verticalement
        width, // Largeur
        height // Hauteur
    );

    // temps depuis lequel on a changé l'image
    const timeSinceChange = Date.now() - player.lastChange;
    if (timeSinceChange > player.animationSpeed) {
        if (!player.eating){
            if (player.InvincibleUntil > Date.now()){
                player.currentImage = (player.currentImage + 1) % numBouleImages;
                player.lastChange = Date.now();
            }
            else if (!player.currentImage == 0){
                // Mettez à jour l'index de l'image actuelle, max entre 1 et le resultat 
                player.currentImage = Math.max(1, (player.currentImage + 1) % numImages);
                player.lastChange = Date.now();
            }
        }
        else{
            player.currentImage = player.currentImage + 1;
            player.lastChange = Date.now();
            if (player.currentImage >= numFoodImages){
                player.eating = false;
                player.currentImage = 1;
                player.hp = Math.min(player.hp + player.pendingHp, player.maxHp);
            }
        }
    }
}

export function eat(hp, animation = true){
    if (player.InvincibleUntil > Date.now()){
        animation = false;
    }
    if (animation){
        if (player.eating){
            player.hp = Math.min(player.hp + player.pendingHp, player.maxHp);
            player.pendingHp = 0;
        }
        player.pendingHp = hp;
        player.currentImage = 1;
        player.eating = true;
    }
    else{
        player.hp = Math.min(player.hp + hp, player.maxHp);
    }
}

export function invinciblePlayer(duration){
    player.InvincibleUntil = Date.now() + duration * 1000;
    player.currentImage = 0;
    player.animationSpeed = player.bouleAnimationSpeed;
}

export function updatePlayer(){
    if (player.InvincibleUntil < Date.now()){
        player.animationSpeed = player.baseAnimationSpeed;
    }
}

export function getScore() {
    return Math.round((Math.floor(elapsedTime) * 0.5 + player.enemyKillCount) * 10);
}