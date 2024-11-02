import { ctx, canvas, getHeight, getWidth } from "./canvas.js";
import { isPhone, getScale, now } from './utils.js';
import { timerTime, gameDifficulty, addGhostTime } from './game.js';
import { changeBackgroundImage } from "./world.js";
import { emptyProjecteurs } from "./projecteur.js";
import { filterEnemies, resetStar, resetGhost, deleteTimeouts, resetLastWave } from "./elements.js";
import { getSettings } from './settings.js';
import { checkPause } from "./pause.js";

let speedPlayer = getSettings().player.desktopSpeed;
let timeGhost = 0;
if (isPhone()) {
    speedPlayer = getSettings().player.phoneSpeed;
}

// Configuration du joueur (toujours au centre)
export let player = {
    x: getWidth() / 2,    // Le joueur reste toujours au centre du canvas
    y: getHeight() / 2,
    radius: getSettings().player.radius * getScale(),             // Taille du cercle
    speed: speedPlayer,                // Vitesse de déplacement
    hp: getSettings().player.maxHp,                   // points de vie
    maxHp: getSettings().player.maxHp,                // points de vie max
    ghostHp: getSettings().player.maxGhostHp,                   // points de vie
    maxGhostHp: getSettings().player.maxGhostHp,                // points de vie max
    currentImage : 0,        // Image actuelle du joueur
    lastChange: 0,           // Dernier changement d'image
    direction: 'b',      // Dernière direction du joueur
    animationSpeed: getSettings().player.baseAnimationSpeed, // Vitesse de l'animation
    baseAnimationSpeed : getSettings().player.baseAnimationSpeed,
    bouleAnimationSpeed : getSettings().player.bouleAnimationSpeed,
    ghostAnimationSpeed : getSettings().player.ghostAnimationSpeed,
    speedUntil : 0,
    eating : false,
    pendingHp : 0,
    InvincibleUntil : 0,
    enemyKillCount: 0,
    isGhost: false,
};

// Fonction pour dessiner la barre de vie en haut à gauche
export function drawHealthBar() {
    if (player.InvincibleUntil < now() && !getGhostStatus()){
        let barWidth = player.radius*1.1;
        const barHeight = 5;
        let barPadding = 3;
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
export function drawGhostBar() {
    if (getGhostStatus()){
        let barWidth = player.radius*1.1;
        const barHeight = 5;
        const barPadding = 8;
        const barX = player.x - barWidth / 2;
        const barY = player.y + player.radius + barHeight + barPadding;
        const barInnerWidth = (player.ghostHp / player.maxGhostHp) * barWidth;

        // gris foncé
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        if(player.ghostHp > 0){
            ctx.fillStyle = "rgb(50, 0, 205)";
            ctx.fillRect(barX, barY, barInnerWidth, barHeight);
        }
    }
}


// Fonction pour dessiner la barre de vie en haut à gauche
export function drawInvincibilityBar() {
    if (player.InvincibleUntil > now() || (getGhostStatus() && player.speedUntil > now())){
        let barWidth = player.radius * 1.1;
        const barHeight = 5;
        let barPadding = 3;
        if (getGhostStatus()){
            barPadding = 8+10;
        }
        const barX = player.x - barWidth / 2;
        const barY = player.y + player.radius + barHeight + barPadding;

        let timeRemaining = player.InvincibleUntil - now();
        let maxTime = 10;
        if (getGhostStatus()){
            timeRemaining = player.speedUntil - now();
            maxTime = 15;
        }

        const barInnerWidth = (timeRemaining / (maxTime*1000)) * barWidth;

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
const numGhostImages = 4;

// Objet pour stocker les images par direction
const playerImages = {};
const bouleImages = {};
const eatingImages = [];
const ghostImages = {};

// Charger les images pour chaque direction
directions.forEach(direction => {
    playerImages[direction] = []; // Créer un tableau pour chaque direction
    bouleImages[direction] = []; // Créer un tableau pour chaque direction
    ghostImages[direction] = []; // Créer un tableau pour chaque direction
    for (let i = 0; i < numImages; i++) {
        const img = new Image();
        img.src = `assets/player/${direction}_${i}.png`; // Nom du fichier d'image
        playerImages[direction].push(img); // Ajouter l'image au tableau de la direction

        if (i < numBouleImages){
            const imgBoule = new Image();
            imgBoule.src = `assets/boule/boule_${direction}_${i+1}.png`; // Nom du fichier d'image
            bouleImages[direction].push(imgBoule); // Ajouter l'image au tableau de la direction
        }

        if (i < numGhostImages){
            const imgGhost = new Image();
            imgGhost.src = `assets/fantome/${direction}_${i+1}.png`; // Nom du fichier d'image
            ghostImages[direction].push(imgGhost); // Ajouter l'image au tableau de la direction
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
    let scale = player.radius * 2; // Multiplier par 2 pour obtenir le diamètre
    if (getGhostStatus()){
        scale *= getSettings().player.ghostScaleMultiplier;
    }
    
    const width = scale;  // Largeur du joueur
    const height = scale; // Hauteur du joueur

    let imageDisplay;

    if (player.eating){
        imageDisplay = eatingImages[player.currentImage];
    }
    else if (getGhostStatus()){
        imageDisplay = ghostImages[player.direction][player.currentImage];
    }
    else if (player.InvincibleUntil > now()){
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
    const timeSinceChange = now() - player.lastChange;
    if (timeSinceChange > player.animationSpeed) {
        if (!player.eating){
            if (!checkPause()){
                if (getGhostStatus()){
                    player.currentImage = (player.currentImage + 1) % numGhostImages;
                }
                else if (player.InvincibleUntil > now()){
                    player.currentImage = (player.currentImage + 1) % numBouleImages;
                }
                else if (!player.currentImage == 0){
                    player.currentImage = Math.max(1, (player.currentImage + 1) % numImages);
                }
            }
            player.lastChange = now();
        }
        else{
            if (!checkPause()){
                player.currentImage = player.currentImage + 1;
                if (player.currentImage >= numFoodImages){
                    player.eating = false;
                    player.currentImage = 1;
                    player.hp = Math.min(player.hp + player.pendingHp, player.maxHp);
                }
            }
            player.lastChange = now();
        }
    }
}

export function eat(hp, animation = true){
    if (player.InvincibleUntil > now()){
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
    player.InvincibleUntil = now() + duration * 1000;
    player.currentImage = 0;
    player.animationSpeed = player.bouleAnimationSpeed;
}

export function updatePlayer(){
    if (player.InvincibleUntil < now() && !getGhostStatus()){
        player.animationSpeed = player.baseAnimationSpeed;
    }
}

export function getScore() {
    let timeFactor = getSettings().score.timeFactor;
    let killCountFactor = getSettings().score.killCountFactor;
    return Math.round((Math.floor(timerTime) * timeFactor + player.enemyKillCount * killCountFactor));
}


export function activateGhost(){
    player.isGhost = true;
    changeBackgroundImage('assets/stone.jpeg');
    player.currentImage = 0;
    player.ghostHp = player.maxGhostHp;
    player.animationSpeed = player.ghostAnimationSpeed;
    player.InvincibleUntil = 0
    resetStar();
    timeGhost = now();
}

export function deactivateGhost(){
    player.isGhost = false;
    changeBackgroundImage('assets/ground.jpeg');
    player.animationSpeed = player.baseAnimationSpeed;
    emptyProjecteurs();
    filterEnemies(0.1);
    resetGhost();
    addGhostTime((now()-timeGhost)/1000);
    deleteTimeouts();
    resetLastWave();
}

export function getGhostStatus(){
    return player.isGhost;
}