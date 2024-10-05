import { drawHealthBar, player, drawPlayer, checkInvincibility } from './player.js';
import { drawWorld } from './world.js';
import { enemySpawnInterval, waveEnemy, drawEnemies, updateEnemies, spawnFood } from './enemy.js';
import { updateMovement, keyDownHandler, keyUpHandler, updateDirection, updateStatic } from './input.js';
import { drawTimer, clearCanvas, resizeCanvas } from './canvas.js';
import { renderJoystick } from './joystick.js';

export let elapsedTime = 0;       // Temps écoulé en secondes
export let startTime = null;      // Pour stocker l'heure du début
export let gameRunning = false;   // Indique si le jeu est en cours
export let difficultyIncreaseRate = 0.015;  // Taux d'augmentation de la difficulté
export let initialDifficulty = 0.25;  // Difficulté initiale

export function gameDifficulty() {
    let b = Math.log(1/initialDifficulty - 1);
    return 1 / (1 + Math.exp(-difficultyIncreaseRate * elapsedTime + b));
}

export function setStartTime() {
    startTime = Date.now();
}

export function getGameRunning() {
    return gameRunning;
}

export function startGame() {
    gameRunning = true;  // Le jeu commence
}

export function restartGame() {
    gameRunning = false;  // Le jeu s'arrête
    
    // Affiche une alerte système avec le temps écoulé
    alert(`Vous avez fait ${Math.floor(elapsedTime)} secondes`);
    
    // recharge la page
    location.reload();
}

function gameLoop() {
    clearCanvas();            // Efface le canvas
    drawWorld();              // Dessine le monde (la grille)
    drawEnemies("above");     // Dessine les ennemis venant du haut
    drawPlayer();             // Dessine le joueur (qui reste au centre)
    drawEnemies("below");     // Dessine les ennemis venant du bas
    updateMovement();         // Met à jour la position du monde
    updateEnemies();          // Met à jour les ennemis
    checkInvincibility();     // Vérifie si le joueur est invincible
    updateDirection();        // Met à jour la direction du joueur
    updateStatic();           // Met à jour l'image statique du joueur
    renderJoystick();             // Boucle de rendu pour les animations
    spawnFood();              // Génère de la nourriture
    
    // Si le jeu est en cours, met à jour le temps écoulé
    if (gameRunning) {
        const currentTime = Date.now();
        elapsedTime = (currentTime - startTime) / 1000;  // Convertit en secondes
    }

    drawTimer();              // Dessine le timer en haut à droite
    drawHealthBar();          // Dessine la barre de vie en haut à gauche

    // // pause the game for 50 milliseconds
    // setTimeout(() => {
    //     requestAnimationFrame(gameLoop);
    // }, 15);

    requestAnimationFrame(gameLoop);  // Boucle continue
}

// Écouteurs d'événements pour les touches du clavier
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// Générer une vague d'ennemis au début du jeu
waveEnemy();

// Générer des ennemis toutes les 2 secondes
setInterval(waveEnemy, enemySpawnInterval);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
// Lancer la boucle de jeu
gameLoop();
