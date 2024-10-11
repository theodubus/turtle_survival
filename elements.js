import { generateNormalRandom, getExponentialRandom, getRandomPointInCircle, getScale, isPhone } from './utils.js';
import { ctx, getHeight, getWidth } from './canvas.js';
import { player, eat, invinciblePlayer } from './player.js';
import { world } from './world.js';
import { getGameRunning, startGame, restartGame, setStartTime } from './game.js';
import { gameDifficulty } from "./game.js";

// Tableau pour stocker les ennemis
let enemies = [];
let nextFood = Date.now() + getExponentialRandom(10) * 1000;
let nextStar = Date.now() + getExponentialRandom(10) * 1000;
let numStars = 0;
let maxStars = 1;
let numFood = 0;
let maxFood = 5;
let meanStarWait = 20;
let dividerRadius = 1;
if (isPhone()){
    dividerRadius = 1.8;
}

// Fonction pour mettre à jour la position des ennemis lorsque le monde bouge
export function updateEnemiesPosition(dx, dy) {
    enemies.forEach(enemy => {
        enemy.x += 2*dx;  // On déplace l'ennemi de la même quantité que le monde
        enemy.y += 2*dy;
        enemy.baseX += 2*dx;
        enemy.baseY += 2*dy;
        if (enemy.targetX != undefined) {
            enemy.targetX += 2*dx;
        }
        if (enemy.targetY != undefined) {
            enemy.targetY += 2*dy;
        }
    });
}

// Intervalle de temps pour ajouter une vague d'ennemis (en millisecondes)
export const enemySpawnInterval = 10000;


// Rayon minimal et maximal autour du joueur où les ennemis peuvent apparaître
const enemySpawnRadius = {
    min: Math.round(Math.max(getWidth(), getHeight())*0.79) / dividerRadius,
    max: Math.round(Math.max(getWidth(), getHeight())*0.83) / dividerRadius,
};

// Fonction pour générer une vague d'ennemis, 10 par defaut, sinon n (parametre)
export function waveEnemy(maxN = 125) {
    let n = Math.ceil(maxN * gameDifficulty());
    for (let i = 0; i < n; i++) {
        // wait 0.1 second before spawning the next enemy
        setTimeout(spawnEnemy, i * 100);
    }
}

export function spawnFood() {
    if (Date.now() > nextFood && numFood < maxFood) {
        spawnEnemy('food');
        numFood += 1;
        let lambda = 1/(3 + 1 * gameDifficulty()); // 3s puis converge vers 4s
        nextFood = Date.now() + getExponentialRandom(lambda) * 1000;
    }
}

export function spawnStar() {
    if (Date.now() > nextStar && numStars < maxStars) {
        spawnEnemy('star');
        numStars += 1;
        let mean = meanStarWait;
        let decrease = (2 - gameDifficulty())/2;
        if (isPhone()){
            decrease = (2 - gameDifficulty())/3;
        }
        meanStarWait = Math.max(1, meanStarWait * decrease); 
        let lambda = 1/mean;
        nextStar = Date.now() + Math.max(Math.min(getExponentialRandom(lambda), 25), 1) * 1000;
    }
}

export function spawnEnemy(typeElement = 'enemy') {
    if (!getGameRunning()) {
        enemies = [];  // Efface tous les ennemis
        setStartTime();  // Démarre le timer lorsque le premier ennemi apparaît
        startGame();  // Marque que le jeu est en cours
    }

    const angle = Math.random() * Math.PI * 2;  // Angle aléatoire
    const distance = Math.random() * (enemySpawnRadius.max - enemySpawnRadius.min) + enemySpawnRadius.min;

    // Coordonnées du nouvel ennemi (par rapport à la position du monde)
    const enemyX = player.x + world.x + Math.cos(angle) * distance;
    const enemyY = player.y + world.y + Math.sin(angle) * distance;

    const playerSpeed = player.speed;  // Vitesse du joueur

    let speedEnemy;
    let damageEnemy;
    let radiusEnemy;
    let hMultiplier;
    if (typeElement == 'food') {
        speedEnemy = playerSpeed * 0.8;
        damageEnemy = 3;
        radiusEnemy = 14;
        hMultiplier = 1.3;
    }
    else if (typeElement == 'star'){
        speedEnemy = 1; // pas 0 pour les calculs de position
        damageEnemy = 0;
        radiusEnemy = 18;
        hMultiplier = 1;
    }
    else {
        speedEnemy = Math.max(0.3 * playerSpeed, Math.min(0.8 * playerSpeed, generateNormalRandom(0.5 * playerSpeed, 0.2 * playerSpeed)));  // Vitesse de déplacement
        damageEnemy = 1;
        radiusEnemy = 18
        hMultiplier = 1.3;
    }

    enemies.push({
        type: typeElement,
        x: enemyX,
        y: enemyY,
        baseX: enemyX,
        baseY: enemyY,
        targetX: undefined,
        targetY: undefined,
        timeLeaveTarget: -1,
        radius: radiusEnemy * getScale(),  // Taille des ennemis
        heightMultiplier: hMultiplier,  // Multiplie la taille de l'ennemi
        speed: speedEnemy, // Vitesse de déplacement
        maxDistance: Math.round(Math.max(getWidth(), getHeight())*1.25) / dividerRadius, // Distance maximale avant que l'ennemi ne disparaisse
        damage: damageEnemy,  // Dégâts infligés au joueur
        animationSpeed: 90,  // Vitesse de l'animation
        currentImage: 1,  // Image actuelle de l'ennemi
        direction: 'b',  // Dernière direction de l'ennemi
        lastChange: Date.now(),  // Dernier changement d'image
        disabledUntil: 0,  // temps desactivation apres attaque
        invincibleDuration : 10, // temps d'invincibilité
    });
}

// Directions disponibles
const directions = ['h', 'hg', 'hd', 'b', 'bg', 'bd', 'g', 'd'];
const numImages = 8; // Nombre d'images par direction (de 0 à 7)

// Objet pour stocker les images par direction
const enemyImages = {};
const foodImages = {};
const starImage = new Image();
starImage.src = 'assets/star.png';

// Charger les images pour chaque direction
directions.forEach(direction => {
    enemyImages[direction] = []; // Créer un tableau pour chaque direction
    foodImages[direction] = [];
    for (let i = 1; i <= numImages; i++) {
        const imgEnemy = new Image();
        const imgFood = new Image();
        imgEnemy.src = `assets/enemy/${direction}_${i}.png`; // Nom du fichier d'image
        imgFood.src = `assets/food/${direction}_${i}.png`; // Nom du fichier d'image
        enemyImages[direction].push(imgEnemy); // Ajouter l'image au tableau de la direction
        foodImages[direction].push(imgFood); // Ajouter l'image au tableau de la direction
    }
});

// Fonction pour dessiner les ennemis
export function drawEnemies(direction = "below") {
    enemies.forEach(enemy => {
        if (direction == "above" && enemy.y + world.y >= player.y + world.y) {
            return;  // Ne dessine pas les ennemis au-dessus du joueur
        }
        if (direction == "below" && enemy.y + world.y < player.y + world.y) {
            return;  // Ne dessine pas les ennemis en dessous du joueur
        }

        // Ajustez la taille du cœur en fonction du rayon de l'ennemi
        const scale = enemy.radius * 2; // Multiplier par 2 pour obtenir le diamètre
        const width = scale;  // Largeur de l'ennemi
        const height = enemy.heightMultiplier*scale; // Hauteur de l'ennemi

        let imgDisp;
        if (enemy.type == 'food') {
            if (enemy.timeLeaveTarget > 0){
                enemy.currentImage = 0;
            }
            imgDisp = foodImages[enemy.direction][enemy.currentImage];
        }
        else if (enemy.type == 'star') {
            imgDisp = starImage;
        }
        else {
            imgDisp = enemyImages[enemy.direction][enemy.currentImage];
        }

        ctx.drawImage(
            imgDisp,
            enemy.x - world.x - width / 2, // Position X (centre l'image)
            enemy.y - world.y - height / 2, // Position Y (centre l'image)
            width, // Largeur
            height // Hauteur
        );

        if (enemy.type == 'food' || enemy.type == 'enemy'){
        // if (true){
            // temps depuis lequel on a changé l'image
            const timeSinceChange = Date.now() - enemy.lastChange;
            if (timeSinceChange > enemy.animationSpeed) {
                // Mettez à jour l'index de l'image actuelle, max entre 1 et le resultat 
                enemy.currentImage = Math.max(1, (enemy.currentImage + 1) % numImages);
                enemy.lastChange = Date.now();
            }
        }
    });
}


// Fonction pour mettre à jour la position des ennemis (ils se dirigent vers le joueur)
export function updateEnemies() {
    enemies = enemies.filter(enemy => {
        let dx = player.x + world.x - enemy.x;  // Distance horizontale entre l'ennemi et le joueur
        let dy = player.y + world.y - enemy.y;  // Distance verticale entre l'ennemi et le joueur
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Si l'ennemi est trop loin, on l'enlève
        if (distance > enemy.maxDistance) {
            if (enemy.type == 'star'){
                numStars -= 1;
            }
            if (enemy.type == 'food'){
                numFood -= 1;
            }
            return false;  // Supprime cet ennemi
        }

        // Détection de collision entre le joueur et l'ennemi
        const tolerance = 1.5; // pour ne pas enlever de la vie si l'ennemi effleure juste le joueur
        if (tolerance*distance < player.radius + enemy.radius) {

            if (player.InvincibleUntil > Date.now()){
                if (enemy.type == 'food') {
                    eat(enemy.damage, false);
                    numFood -= 1;
                }
                if (enemy.type == 'star'){
                    invinciblePlayer(enemy.invincibleDuration);
                    meanStarWait = 25 * (4-gameDifficulty())/4;
                    numStars -= 1;
                }
                if (enemy.type == 'enemy'){
                    player.enemyKillCount += 1;
                }
                return false;
            }

            if (enemy.type == 'food') {
                eat(enemy.damage);
                numFood -= 1;
                return false;
            }

            if(enemy.type == 'star'){
                invinciblePlayer(enemy.invincibleDuration);
                meanStarWait = 25 * (4-gameDifficulty())/4;
                numStars -= 1;
                return false;
            }


            if (enemy.disabledUntil < Date.now()){
                player.hp -= enemy.damage;
                enemy.disabledUntil = Date.now() + 1000;
            }

            if (player.hp <= 0) {
                restartGame();  // Redémarre le jeu si collision
                return false;  // Supprime l'ennemi et arrête le jeu
            }
        }

        if (distance > 0) {
            if (enemy.type == 'food') {
                let speedEnemy = enemy.speed;
                if (enemy.targetX == undefined || enemy.targetY == undefined){
                    [enemy.targetX, enemy.targetY] = getRandomPointInCircle(enemy.baseX, enemy.baseY, 75);
                }
                dx = enemy.targetX - enemy.x;
                dy = enemy.targetY - enemy.y;
                distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 5) {
                    if (enemy.timeLeaveTarget < 0) {
                        enemy.timeLeaveTarget = Date.now() + 1500;
                    }
                    else if (Date.now() > enemy.timeLeaveTarget) {
                        [enemy.targetX, enemy.targetY] = getRandomPointInCircle(enemy.baseX, enemy.baseY, 80);
                        enemy.timeLeaveTarget = -1;
                    }
                }
                else {
                    const moveX = (dx / distance) * speedEnemy;
                    const moveY = (dy / distance) * speedEnemy;
                    enemy.x += moveX;
                    enemy.y += moveY;
                }
                

            }
            else if (enemy.type == 'enemy'){
                let speedEnemy = enemy.speed * (gameDifficulty() + 2) / 3;
                // Normalisation du vecteur directionnel
                const moveX = (dx / distance) * speedEnemy;
                const moveY = (dy / distance) * speedEnemy;

                // Mise à jour de la position de l'ennemi
                enemy.x += moveX;
                enemy.y += moveY;
            }


            // Mise à jour de la direction de l'ennemi, calcul de l'angle
            const angle = Math.atan2(dy, dx);
            if (angle > -Math.PI / 8 && angle <= Math.PI / 8) {
                enemy.direction = 'd';  // Droite
            } else if (angle > Math.PI / 8 && angle <= 3 * Math.PI / 8) {
                enemy.direction = 'bd';  // Bas droite
            } else if (angle > 3 * Math.PI / 8 && angle <= 5 * Math.PI / 8) {
                enemy.direction = 'b';  // Bas
            } else if (angle > 5 * Math.PI / 8 && angle <= 7 * Math.PI / 8) {
                enemy.direction = 'bg';  // Bas gauche
            } else if (angle > 7 * Math.PI / 8 || angle <= -7 * Math.PI / 8) {
                enemy.direction = 'g';  // Gauche
            } else if (angle > -7 * Math.PI / 8 && angle <= -5 * Math.PI / 8) {
                enemy.direction = 'hg';  // Haut gauche
            } else if (angle > -5 * Math.PI / 8 && angle <= -3 * Math.PI / 8) {
                enemy.direction = 'h';  // Haut
            } else if (angle > -3 * Math.PI / 8 && angle <= -Math.PI / 8) {
                enemy.direction = 'hd';  // Haut droite
            }
        }
        return true;  // Conserve cet ennemi
    });
}