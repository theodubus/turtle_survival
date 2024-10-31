import { activateGhost, drawHealthBar, drawInvincibilityBar, drawGhostBar, drawPlayer, updatePlayer, getScore, getGhostStatus, player } from './player.js';
import { drawWorld, createRadialGradient, world } from './world.js';
import { enemySpawnInterval, waveEnemy, drawEnemy, updateEnemies, spawnFood, spawnStar, spawnGhost, drawArrows, getEntities } from './elements.js';
import { updateMovement, keyDownHandler, keyUpHandler, updateDirection, updateStatic } from './input.js';
import { drawTimer, clearCanvas, resizeCanvas } from './canvas.js';
import { renderJoystick } from './joystick.js';
import { generateNormalRandom } from "./utils.js";

import { drawProjecteur, addProjecteur, getProjecteurs, drawProjecteurBase, projectorDamage, updateProjecteurs } from "./projecteur.js";

export let elapsedTime = 0;       // Temps écoulé en secondes
export let startTime = null;      // Pour stocker l'heure du début
export let gameRunning = false;   // Indique si le jeu est en cours
export let difficultyIncreaseRate = 0.0175;  // Taux d'augmentation de la difficulté
export let initialDifficulty = 0.25;  // Difficulté initiale
let nextProjecteur = undefined;

export function addDeltaTimeDifficulty(t) {
    startTime += t;
}

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
    alert(`Vous avez fait ${getScore()} points`);
    
    // recharge la page
    location.reload();
}

let lastFrameTime = Date.now();
export let deltaTime = 0;
export function getDeltaTime() {
    return deltaTime;
}

function drawAllEntities(){
    let projecteurs = getProjecteurs();
    let entities = getEntities();

    let allElements = [];

    for (let i = 0; i < projecteurs.length; i++) {
        allElements.push(["projecteur", projecteurs[i], projecteurs[i].y + projecteurs[i].r_y + world.y]);
        drawProjecteurBase(projecteurs[i]);
    }
    for (let i = 0; i < entities.length; i++) {
        allElements.push(["entite", entities[i], entities[i].y - world.y]);
    }
    allElements.push(["player", false, player.y]);

    allElements.sort(function(a, b) {
        return a[2] - b[2];
    });

    for (let i = 0; i < allElements.length; i++) {
        if (allElements[i][0] == "projecteur"){
            drawProjecteur(allElements[i][1]);
        }
        else if (allElements[i][0] == "entite"){
            drawEnemy(allElements[i][1]);
        }
        else if (allElements[i][0] == "player"){
            drawPlayer();
        }
    }
}


function gameLoop() {

    // Calcul du temps écoulé depuis la dernière frame
    const currentTime = Date.now();
    deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;

    clearCanvas();            // Efface le canvas
    drawWorld();              // Dessine le monde (la grille)
    drawAllEntities();        // Dessine les entités (ennemis, joueur, etc.)
    updateMovement();         // Met à jour la position du monde
    updateEnemies();          // Met à jour les ennemis
    updateDirection();        // Met à jour la direction du joueur
    updateStatic();           // Met à jour l'image statique du joueur
    renderJoystick();             // Boucle de rendu pour les animations
    spawnFood();              // Génère de la nourriture
    spawnStar();              // Génère des étoiles
    spawnGhost();             // Génère des fantômes
    updatePlayer();           // Met à jour le joueur
    updateProjecteurs();
    projectorDamage();

    drawArrows();             // Dessine les flèches de direction

    if (getGhostStatus()) {
        createRadialGradient();

        if (nextProjecteur === undefined) {
            nextProjecteur = Date.now() + generateNormalRandom(8000, 1000);
        }
        if (Date.now() > nextProjecteur) {
            addProjecteur();
            nextProjecteur = Date.now() + generateNormalRandom(8000, 1000);
        }
    }

    drawInvincibilityBar();   // Dessine la barre d'invincibilité en haut à gauche
    
    // Si le jeu est en cours, met à jour le temps écoulé
    if (gameRunning && !getGhostStatus()){
        const currentTime = Date.now();
        elapsedTime = (currentTime - startTime) / 1000;  // Convertit en secondes
    }

    drawTimer();              // Dessine le timer en haut à droite
    drawHealthBar();          // Dessine la barre de vie en haut à gauche
    drawGhostBar();           // Dessine la barre de vie en haut à gauche

    // // pause the game for 50 milliseconds
    // setTimeout(() => {
    //     requestAnimationFrame(gameLoop);
    // }, 20);

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
