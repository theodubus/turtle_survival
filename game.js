import { activateGhost, drawHealthBar, drawInvincibilityBar, drawGhostBar, drawPlayer, updatePlayer, getScore, getGhostStatus, player } from './player.js';
import { drawWorld, createRadialGradient, world } from './world.js';
import { getWaveEnemy, drawEnemy, updateEnemies, spawnFood, spawnStar, spawnGhost, drawArrows, getEntities, waveEnemy } from './elements.js';
import { updateMovement, keyDownHandler, keyUpHandler, updateDirection, updateStatic } from './input.js';
import { drawTimer, clearCanvas, resizeCanvas } from './canvas.js';
import { renderJoystick } from './joystick.js';
import { generateNormalRandom, now } from "./utils.js";
import { drawProjecteur, addProjecteur, getProjecteurs, drawProjecteurBase, projectorDamage, updateProjecteurs } from "./projecteur.js";
import { getSettings } from './settings.js';
import { checkQuit, pauseGame, checkPause, drawPause } from './pause.js';

export let elapsedTime = 0;       // Temps écoulé en secondes
export let timerTime = 0;         // Temps écoulé en secondes
export let delta = 0;             // Temps écoulé en secondes
export let startTime = Date.now();      // Pour stocker l'heure du début
export let gameRunning = false;   // Indique si le jeu est en cours
export let difficultyIncreaseRate = getSettings().difficultyIncreaseRate;  // Taux d'augmentation de la difficulté
export let initialDifficulty = getSettings().initialDifficulty;  // Difficulté initiale
let nextProjecteur = undefined;

export function addDeltaTimeDifficulty(t) {
    startTime += t;
}

export function addGhostTime(t) {
    delta += t;
}

export function gameDifficulty() {
    let b = Math.log(1/initialDifficulty - 1);
    return 1 / (1 + Math.exp(-difficultyIncreaseRate * timerTime + b));
}

export function restartGame() {    
    // Affiche une alerte système avec le temps écoulé
    alert(`Vous avez fait ${getScore()} points`);
    
    // recharge la page
    location.reload();
}

let lastFrameTime = now();
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

function projectorHandle(){
    if (getGhostStatus()) {
        if (nextProjecteur === undefined) {
            nextProjecteur = now() + generateNormalRandom(2000, 500);
        }
        if (now() > nextProjecteur) {
            addProjecteur();
            nextProjecteur = now() + generateNormalRandom(8000, 1000);
        }
        updateProjecteurs();
        projectorDamage();
    }
}

function gameLoop() {

    // Calcul du temps écoulé depuis la dernière frame
    const currentTime = now();
    deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    
    clearCanvas();            // Efface le canvas
    drawWorld();              // Dessine le monde (la grille)
    drawAllEntities();        // Dessine les entités (ennemis, joueur, etc.)
    drawArrows();             // Dessine les flèches de direction
    
    if (!checkPause()) {
        checkQuit();
        getWaveEnemy();
        updateEnemies();          // Met à jour les ennemis
        updateDirection();        // Met à jour la direction du joueur
        updateMovement();         // Met à jour la position du monde
        updateStatic();           // Met à jour l'image statique du joueur
        spawnFood();              // Génère de la nourriture
        spawnStar();              // Génère des étoiles
        spawnGhost();             // Génère des fantômes
        updatePlayer();           // Met à jour le joueur
        projectorHandle();
        renderJoystick();             // Boucle de rendu pour les animations
        
        const currentTime = Date.now();
        elapsedTime = (currentTime - startTime) / 1000;  // Convertit en secondes
        
        // freeze timer when ghost
        if (!getGhostStatus()){
            timerTime = elapsedTime - delta;
        }
    }

        
    
    drawInvincibilityBar();   // Dessine la barre d'invincibilité en haut à gauche
    drawHealthBar();          // Dessine la barre de vie en haut à gauche
    drawGhostBar();           // Dessine la barre de vie en haut à gauche
    createRadialGradient();
    drawTimer();              // Dessine le timer en haut à droite
    drawPause();         

    // // pause the game for 50 milliseconds
    // setTimeout(() => {
    //     requestAnimationFrame(gameLoop);
    // }, 20);

    requestAnimationFrame(gameLoop);  // Boucle continue
}

// Écouteurs d'événements pour les touches du clavier
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

window.addEventListener('resize', resizeCanvas);

waveEnemy();

gameLoop();
