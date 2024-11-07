import { generateNormalRandom, getNormalRandom, getRandomPointInCircle, getScale, isPhone, now } from './utils.js';
import { ctx, getHeight, getWidth } from './canvas.js';
import { player, eat, invinciblePlayer, drawHealthBar, getGhostStatus, activateGhost, deactivateGhost } from './player.js';
import { world } from './world.js';
import { gameDifficulty, getDeltaTime, changeStage } from './game.js';
import { getSettings } from './settings.js';
import { checkPause } from './pause.js';

// Tableau pour stocker les ennemis
let enemies = [];
let timeoutIDs = [];
let nextFood = undefined;
let nextStar = undefined;
let nextGhost = undefined;
let numStars = 0;
let maxStars = getSettings().entities.star.max;
let numGhost = 0;
let maxGhost = getSettings().entities.ghost.max;
let firstGhost = 1;
let numFood = 0;
let maxFood = getSettings().entities.food.max;
let lastWave = 0;

let dividerRadius = getSettings().destopDividerRadius;
if (isPhone()){
    dividerRadius = getSettings().phoneDividerRadius;
}

export function getEntities(){
    return enemies;
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
export const enemySpawnInterval = getSettings().entities.enemySpawnInterval;


// Rayon minimal et maximal autour du joueur où les ennemis peuvent apparaître
const enemySpawnRadius = {
    min: Math.round(Math.max(getWidth(), getHeight())*0.80) / dividerRadius,
    max: Math.round(Math.max(getWidth(), getHeight())*1) / dividerRadius,
};

// Rayon minimal et maximal autour du joueur où les ennemis peuvent apparaître
const elementSpawnRadius = {
    min: Math.round(Math.max(getWidth(), getHeight())*0.9) / dividerRadius,
    max: Math.round(Math.max(getWidth(), getHeight())*2) / dividerRadius,
};

// Rayon minimal et maximal autour du joueur où les ennemis peuvent apparaître
const elementSpawnRadiusGhost = {
    min: Math.round(Math.max(getWidth(), getHeight())*0.8) / dividerRadius,
    max: Math.round(Math.max(getWidth(), getHeight())*1.2) / dividerRadius,
};

export function deleteTimeouts(){
    timeoutIDs.forEach((timeoutID) => { clearTimeout(timeoutID); });
    timeoutIDs.length = 0;
}

// Fonction pour générer une vague d'ennemis, 10 par defaut, sinon n (parametre)
export function waveEnemy() {
    let maxN = getSettings().entities.maxEnemiesPerWave;
    
    let n = Math.ceil(maxN * gameDifficulty());
    if (getGhostStatus()){
        n *= getSettings().entities.ghostMultiplier;
    }
    for (let i = 0; i < n; i++) {
        // wait 0.1 second before spawning the next enemy
        timeoutIDs.push(setTimeout(spawnEnemy, i * 100));        
    }
}

export function getWaveEnemy(){
    if (now() - lastWave > enemySpawnInterval){
        waveEnemy();
        lastWave = now();
    }
}

export function resetLastWave(){
    lastWave = 0;
}
    

export function spawnFood() {
    let mean = getSettings().entities.food.meanSpawnRate;
    mean -= getSettings().entities.food.meanSpawnRateReduction * gameDifficulty();
    let stdDev = getSettings().entities.food.stdSpawnRate;

    if (nextFood == undefined){
        nextFood = now() + getNormalRandom(mean, stdDev) * 1000;
    }
    else if (now() > nextFood && numFood < maxFood) {
        spawnEnemy('food');
        numFood += 1;
        nextFood = now() + getNormalRandom(mean, stdDev) * 1000;
    }
}

export function resetGhost() {
    firstGhost = 0;
    nextGhost = undefined;
}

export function spawnGhost() {
    let mean = getSettings().entities.ghost.meanSpawnRate;
    mean -= getSettings().entities.ghost.meanSpawnRateReduction * gameDifficulty();
    mean += getSettings().entities.ghost.firstSpawnAddition * firstGhost;
    let stdDev = getSettings().entities.ghost.stdSpawnRate;

    if (nextGhost == undefined){
        nextGhost = now() + getNormalRandom(mean, stdDev) * 1000;
    }
    else if (now() > nextGhost && numGhost < maxGhost) {
        if (getGhostStatus()){
            return;
        }
        spawnEnemy('ghost');
        numGhost += 1;
        nextGhost = now() + getNormalRandom(mean, stdDev) * 1000;
    }
}

export function spawnStar() {
    let mean = getSettings().entities.star.meanSpawnRate;
    mean -= getSettings().entities.star.meanSpawnRateReduction * gameDifficulty();
    let stdDev = getSettings().entities.star.stdSpawnRate;

    let position = undefined; 
    if (getGhostStatus()){
        mean = getSettings().entities.star.meanGhostSpawnRate;
    }
    if (nextStar == undefined){
        nextStar = now() + getNormalRandom(mean, stdDev) * 1000;
        if (getGhostStatus()){
            nextStar = now();
            let distanceStar = getSettings().entities.star.ghostInitStarDistance;
            position = [player.x + world.x, player.y + world.y + distanceStar];
            spawnEnemy('star', position);
            numStars += 1;
            nextStar = now() + getNormalRandom(mean, stdDev) * 1000;
        }
    }
    else if (player.InvincibleUntil > now() && numStars < maxStars){
        let delta = Math.abs(nextStar - now());
        let minimumWaitTime = getSettings().entities.star.minimumWaitTime;
        if (delta < minimumWaitTime || nextStar < now()){
            nextStar = Math.max(nextStar, now()) + getNormalRandom(mean/2, stdDev/2) * 1000;
        }
    }
    else if (now() > nextStar && numStars < maxStars) {
        spawnEnemy('star');
        numStars += 1;
        nextStar = now() + getNormalRandom(mean, stdDev) * 1000;
    }
}


export function resetStar() {
    nextStar = undefined;
    enemies.forEach(enemy => {
        if (enemy.type == 'star'){
            enemy.stop = true;
        }
    });
    numStars = 0;
}

export function spawnEnemy(typeElement = 'enemy', position = undefined) {
    const angle = Math.random() * Math.PI * 2;  // Angle aléatoire
    let distance;
    if (typeElement == 'enemy'){
        distance = Math.random() * (enemySpawnRadius.max - enemySpawnRadius.min) + enemySpawnRadius.min;
    }
    else if (getGhostStatus() && typeElement == 'star'){
        distance = Math.random() * (elementSpawnRadiusGhost.max - elementSpawnRadiusGhost.min) + elementSpawnRadiusGhost.min;
    }
    else {
        distance = Math.random() * (elementSpawnRadius.max - elementSpawnRadius.min) + elementSpawnRadius.min;
    }

    let enemyX, enemyY;

    // Coordonnées du nouvel ennemi (par rapport à la position du monde)
    if (position != undefined){
        enemyX = position[0];
        enemyY = position[1];
    }
    else{
        enemyX = player.x + world.x + Math.cos(angle) * distance;
        enemyY = player.y + world.y + Math.sin(angle) * distance;
    }


    const playerSpeed = player.speed;  // Vitesse du joueur

    let speedEnemy;
    let damageEnemy;
    let radiusEnemy;
    let hMultiplier;
    let maxD;
    let animSpeed;
    let maxMult;
    if (typeElement == 'food') {
        speedEnemy = playerSpeed * getSettings().entities.food.playerSpeedRatio;
        damageEnemy = getSettings().entities.food.damage;
        radiusEnemy = getSettings().entities.food.radius;
        hMultiplier = getSettings().entities.food.heightMultiplier;
        animSpeed = getSettings().entities.food.animationSpeed;
        maxMult = getSettings().entities.food.maxDistance;
        maxD = Math.round(Math.max(getWidth(), getHeight())*maxMult) / dividerRadius
    }
    else if (typeElement == 'star'){
        speedEnemy = getSettings().entities.star.speed;
        damageEnemy = getSettings().entities.star.damage;
        radiusEnemy = getSettings().entities.star.radius;
        hMultiplier = getSettings().entities.star.heightMultiplier;
        animSpeed = getSettings().entities.star.animationSpeed;
        maxMult = getSettings().entities.star.maxDistance;
        maxD = Math.round(Math.max(getWidth(), getHeight())*maxMult) / dividerRadius
    }
    else if (typeElement == 'ghost'){
        speedEnemy = playerSpeed * getSettings().entities.ghost.playerSpeedRatio;
        damageEnemy = getSettings().entities.ghost.damage;
        radiusEnemy = getSettings().entities.ghost.radius;
        hMultiplier = getSettings().entities.ghost.heightMultiplier;
        animSpeed = getSettings().entities.ghost.animationSpeed;
        maxMult = getSettings().entities.ghost.maxDistance;
        maxD = Math.round(Math.max(getWidth(), getHeight())*maxMult) / dividerRadius
    }
    else {
        let minRatio = getSettings().entities.enemy.minPlayerSpeedRatio;
        let maxRatio = getSettings().entities.enemy.maxPlayerSpeedRatio;
        let meanRatio = getSettings().entities.enemy.meanPlayerSpeedRatio;
        let stdRatio = getSettings().entities.enemy.stdPlayerSpeedRatio;

        speedEnemy = Math.max(minRatio * playerSpeed, Math.min(maxRatio * playerSpeed, generateNormalRandom(meanRatio * playerSpeed, stdRatio * playerSpeed)));  // Vitesse de déplacement
        damageEnemy = getSettings().entities.enemy.damage;
        radiusEnemy = getSettings().entities.enemy.radius;
        hMultiplier = getSettings().entities.enemy.heightMultiplier;
        maxMult = getSettings().entities.enemy.maxDistance;
        maxD = Math.round(Math.max(getWidth(), getHeight())*maxMult) / dividerRadius
        animSpeed = getSettings().entities.enemy.animationSpeed;
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
        maxDistance: maxD, // Distance maximale avant que l'ennemi ne disparaisse
        damage: damageEnemy,  // Dégâts infligés au joueur
        animationSpeed: animSpeed,  // Vitesse de l'animation
        greenAnimationSpeed: getSettings().entities.greenEnemy.animationSpeed,  // Vitesse de l'animation
        currentImage: 1,  // Image actuelle de l'ennemi
        direction: 'b',  // Dernière direction de l'ennemi
        lastChange: now(),  // Dernier changement d'image
        disabledUntil: 0,  // temps desactivation apres attaque
        speedDuration : getSettings().entities.star.speedDuration, // temps de vitesse augmentée
        invincibleDuration : getSettings().entities.star.invincibleDuration, // temps d'invincibilité
        stop: false, // delete enemy at next update
    });
}

// Directions disponibles
const directions = ['h', 'hg', 'hd', 'b', 'bg', 'bd', 'g', 'd'];
const numImages = 8; // Nombre d'images par direction (de 0 à 7)
const numGhostImages = 4; // Nombre d'images par direction (de 0 à 3)

// Objet pour stocker les images par direction
const enemyImages = {};
const foodImages = {};
const enemygreenImages = {};
const ghostImages = {};
const starImage = new Image();
starImage.src = 'assets/star.png';

// Charger les images pour chaque direction
directions.forEach(direction => {
    enemyImages[direction] = []; // Créer un tableau pour chaque direction
    foodImages[direction] = [];
    enemygreenImages[direction] = [];
    ghostImages[direction] = [];
    for (let i = 1; i <= numImages; i++) {
        const imgEnemy = new Image();
        const imgFood = new Image();
        const imgEnemyGreen = new Image();
        imgEnemy.src = `assets/enemy/${direction}_${i}.png`; // Nom du fichier d'image
        imgFood.src = `assets/food/${direction}_${i}.png`; // Nom du fichier d'image
        imgEnemyGreen.src = `assets/enemy_green/${direction}_${i}.png`; // Nom du fichier d'image
        enemyImages[direction].push(imgEnemy); // Ajouter l'image au tableau de la direction
        foodImages[direction].push(imgFood); // Ajouter l'image au tableau de la direction
        enemygreenImages[direction].push(imgEnemyGreen); // Ajouter l'image au tableau de la direction

        if (i <= numGhostImages){
            const imgGhost = new Image();
            imgGhost.src = `assets/fantome/${direction}_${i}.png`; // Nom du fichier d'image
            ghostImages[direction].push(imgGhost); // Ajouter l'image au tableau de la direction
        }
    }
});

export function drawArrows() {
    enemies.forEach(enemy => {
        
        // déterminer si l'ennemi est dans le champ de vision du joueur, cad dans le canvas
        let visible = true;
        if (enemy.x - world.x > 0 && enemy.x - world.x < getWidth() && enemy.y - world.y > 0 && enemy.y - world.y < getHeight()){
            visible = false;
        }

        let display = false;
        if (enemy.type == 'food' || enemy.type == 'star' || enemy.type == 'ghost'){
            display = true;
        }

        if (display && visible){
            // coordonnées de la droite entre l'ennemi et le joueur
            let dx = player.x + world.x - enemy.x;
            let dy = player.y + world.y - enemy.y;

            let m = dy/dx;
            let p = (enemy.y - world.y) - m * (enemy.x - world.x);

            let x1 = (0 - p) / m;
            let x2 = (getHeight() - p) / m;
            let y1 = m * 0 + p;
            let y2 = m * getWidth() + p;

            x1 = Math.max(0, Math.min(getWidth(), x1));
            x2 = Math.max(0, Math.min(getWidth(), x2));
            y1 = Math.max(0, Math.min(getHeight(), y1));
            y2 = Math.max(0, Math.min(getHeight(), y2));
            
            let dx1 = x1 - enemy.x + world.x;
            let dy1 = y1 - enemy.y + world.y;
            let dx2 = x2 - enemy.x + world.x;
            let dy2 = y2 - enemy.y + world.y;

            let d1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
            let d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            let d3 = Math.sqrt(dx1 * dx1 + dy2 * dy2);
            let d4 = Math.sqrt(dx2 * dx2 + dy1 * dy1);

            let x, y;

            if (Math.min(d1, d2, d3, d4) == d1){
                x = x1;
                y = y1;
            }
            else if (Math.min(d1, d2, d3, d4) == d2){
                x = x2;
                y = y2;
            }
            else if (Math.min(d1, d2, d3, d4) == d3){
                x = x1;
                y = y2;
            }
            else {
                x = x2;
                y = y1;
            }

            drawPin(ctx, x, y, dx, dy, enemy);

        }
    });
}

function drawPin(ctx, x, y, dx, dy, entity) {
    let pinRadius = getSettings().desktopPinRadius;
    if (isPhone()){
        pinRadius = getSettings().phonePinRadius;
    }
    const pinLength = pinRadius * 1.6;

    let color = getSettings().pinFirstColor;
    let secondColor = getSettings().pinSecondColor;

    // Calcule l'angle de la pointe pour pointer vers l'objet (à partir de dx, dy)
    const angle = Math.atan2(dy, dx);

    const tipAngle = Math.PI / 1.4;  // Angle de la pointe du "pin", 1.4 est la bonne valeur pour que la pointe se fonde dans le cercle

    // Calcul des coordonnées pour l'extrémité du cercle
    const circleX = x + pinLength * Math.cos(angle);
    const circleY = y + pinLength * Math.sin(angle);

    // Dessine la pointe du "pin" (un petit triangle pointant vers x, y)
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
        circleX + pinRadius * Math.cos(angle + tipAngle),
        circleY + pinRadius * Math.sin(angle + tipAngle)
    );
    ctx.lineTo(
        circleX + pinRadius * Math.cos(angle - tipAngle),
        circleY + pinRadius * Math.sin(angle - tipAngle)
    );
    ctx.closePath();
    ctx.fillStyle = color;  // Couleur de la pointe
    ctx.fill();

    // // Dessine le cercle
    // ctx.beginPath();
    // ctx.arc(circleX, circleY, pinRadius, 0, Math.PI * 2);
    // ctx.fillStyle = color;  // Couleur du cercle
    // ctx.fill();

    // dessine le cercle sans la partie du triangle
    ctx.beginPath();
    ctx.arc(circleX, circleY, pinRadius, angle - tipAngle, angle + tipAngle, false);
    ctx.fillStyle = color;  // Couleur transparente
    ctx.fill();

    // Dessine un plus petit cercle au centre du cercle
    ctx.beginPath();
    ctx.arc(circleX, circleY, pinRadius * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = secondColor;  // Couleur du cercle
    ctx.fill();

    let image;
    if (entity.type == 'food'){
        image = foodImages['b'][0];
    }
    else if (entity.type == 'ghost'){
        image = ghostImages['b'][1];
    }
    else if (entity.type == 'star'){
        image = starImage;
    }

    let scale = pinRadius * 1.2;
    if (entity.heightMultiplier == 1){
        scale = pinRadius * 1.4;
    }
    let height = entity.heightMultiplier*scale;
    let width = scale;

    // Dessine l'image au centre du cercle
    ctx.drawImage(
        image,
        circleX - width / 2, // Position X (centre l'image)
        circleY - height / 2, // Position Y (centre l'image)
        width, // Largeur
        height // Hauteur
    );

    
}


// Fonction pour dessiner les ennemis
export function drawEnemy(enemy) {
    let margin = getSettings().entities.renderMargin;
    // si l'ennemi n'est pas dans le champ de vision du joueur, on ne le dessine pas, on met une marge de 20px pour ne pas le dessiner trop tard
    if (enemy.x - world.x < -margin || enemy.x - world.x > getWidth() + margin || enemy.y - world.y < -margin || enemy.y - world.y > getHeight() + margin){
        return;
    }

    let addGreen = 0;
    let reduceScale = 1;
    if (getGhostStatus()){
        if (enemy.heightMultiplier != 1){
            addGreen = getSettings().entities.greenEnemy.heightAddition;
        }
        reduceScale = getSettings().entities.ghost.reduceScale;
    }

    // Ajustez la taille du cœur en fonction du rayon de l'ennemi
    const scale = (enemy.radius * 2)/reduceScale; // Multiplier par 2 pour obtenir le diamètre
    const width = scale;  // Largeur de l'ennemi

    const height = (enemy.heightMultiplier + addGreen)*(scale); // Hauteur de l'ennemi

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
    else if (enemy.type == 'ghost'){
        imgDisp = ghostImages[enemy.direction][enemy.currentImage];
    }
    else {
        if (getGhostStatus()){
            imgDisp = enemygreenImages[enemy.direction][enemy.currentImage];
        }
        else{
            imgDisp = enemyImages[enemy.direction][enemy.currentImage];
        }
    }

    ctx.drawImage(
        imgDisp,
        enemy.x - world.x - width / 2, // Position X (centre l'image)
        enemy.y - world.y - height / 2, // Position Y (centre l'image)
        width, // Largeur
        height // Hauteur
    );

    if (enemy.type == 'food' || enemy.type == 'enemy' || enemy.type == 'ghost'){                
    // if (true){
        // temps depuis lequel on a changé l'image
        const timeSinceChange = now() - enemy.lastChange;
        if (timeSinceChange > enemy.animationSpeed || (getGhostStatus() && timeSinceChange > enemy.greenAnimationSpeed)) {
            // Mettez à jour l'index de l'image actuelle, max entre 1 et le resultat 
            if (!checkPause()){
                if (enemy.type == "ghost"){
                    enemy.currentImage = (enemy.currentImage + 1) % numGhostImages;
                }
                else if (enemy.type == "enemy"){
                    enemy.currentImage = (enemy.currentImage + 1) % numImages;
                }
                else{
                    enemy.currentImage = Math.max(1, (enemy.currentImage + 1) % numImages);
                }
            }
            enemy.lastChange = now();
        }
    }
}


// Fonction pour mettre à jour la position des ennemis (ils se dirigent vers le joueur)
export function updateEnemies() {
    let enemy_ghost_mutliplier = 1;
    if (getGhostStatus()){
        enemy_ghost_mutliplier = -1.4;
    }
    enemies = enemies.filter(enemy => {
        if (enemy.stop){
            return false;
        }

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
            if (enemy.type == 'ghost'){
                numGhost -= 1;
            }
            return false;  // Supprime cet ennemi
        }

        // Détection de collision entre le joueur et l'ennemi
        let tolerance = getSettings().entities.baseTolerance;
        let multiplier = 1;
        let divider = 1;
        if (getGhostStatus()){
            multiplier = 1 + ((1-getSettings().player.ghostScaleMultiplier)/2);
            divider = 1 + ((1-getSettings().entities.ghost.reduceScale)/2);
            tolerance = getSettings().entities.ghostTolerance;
        }
        if (tolerance*distance < (player.radius*multiplier) + (enemy.radius/divider)) {

            if (getGhostStatus()){
                if (enemy.type == 'food') {
                    eat(enemy.damage, false);
                    numFood -= 1;
                }
                if (enemy.type == 'star'){
                    numStars -= 1;
                    player.speedUntil = now() + enemy.speedDuration * 1000;
                }
                if (enemy.type == 'enemy'){
                    player.enemyKillCount += getSettings().entities.greenEnemy.killPoints;
                }
                if (enemy.type == 'ghost'){
                    numGhost -= 1;
                }
                return false;
            }

            if (player.InvincibleUntil > now()){
                if (enemy.type == 'food') {
                    eat(enemy.damage, false);
                    numFood -= 1;
                }
                if (enemy.type == 'star'){
                    invinciblePlayer(enemy.invincibleDuration);
                    numStars -= 1;
                }
                if (enemy.type == 'enemy'){
                    player.enemyKillCount += getSettings().entities.enemy.killPoints;
                }
                if (enemy.type == 'ghost'){
                    numGhost -= 1;
                    activateGhost();
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
                numStars -= 1;
                return false;
            }

            if (enemy.type == 'ghost'){
                numGhost -= 1;
                activateGhost();
                return false;
            }

            if (enemy.disabledUntil < now()){
                player.hp -= enemy.damage;
                enemy.disabledUntil = now() + 1000;
            }

            if (player.hp <= 0) {
                changeStage("death");
                return false;  // Supprime l'ennemi et arrête le jeu
            }
        }

        if (distance > 0) {
            if (enemy.type == 'food' || enemy.type == 'ghost') {
                let speedEnemy = enemy.speed;
                let radius = getSettings().entities.food.walkRadius;
                if (enemy.type == 'ghost'){
                    radius = getSettings().entities.ghost.walkRadius;
                }
                if (enemy.targetX == undefined || enemy.targetY == undefined){
                    [enemy.targetX, enemy.targetY] = getRandomPointInCircle(enemy.baseX, enemy.baseY, radius);
                }
                dx = enemy.targetX - enemy.x;
                dy = enemy.targetY - enemy.y;
                distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 5) {
                    if (enemy.timeLeaveTarget < 0) {
                        if (enemy.type == 'food'){
                            enemy.timeLeaveTarget = now() + 1500;
                        }
                        else {
                            enemy.timeLeaveTarget = now() + 1500;
                        }
                    }
                    else if (now() > enemy.timeLeaveTarget) {
                        [enemy.targetX, enemy.targetY] = getRandomPointInCircle(enemy.baseX, enemy.baseY, radius);
                        enemy.timeLeaveTarget = -1;
                    }
                }
                else {
                    const moveX = (dx / distance) * speedEnemy * getDeltaTime();
                    const moveY = (dy / distance) * speedEnemy * getDeltaTime();
                    enemy.x += moveX;
                    enemy.y += moveY;
                }
                

            }
            else if (enemy.type == 'enemy'){
                let speedEnemy = enemy.speed * (gameDifficulty() + 2) / 3;
                // Normalisation du vecteur directionnel
                const moveX = (dx / distance) * speedEnemy * getDeltaTime() * enemy_ghost_mutliplier;
                const moveY = (dy / distance) * speedEnemy * getDeltaTime() * enemy_ghost_mutliplier;

                // Mise à jour de la position de l'ennemi
                enemy.x += moveX;
                enemy.y += moveY;
            }


            // Mise à jour de la direction de l'ennemi, calcul de l'angle
            let angle = Math.atan2(dy, dx);
            if (enemy_ghost_mutliplier < 0 && enemy.type == 'enemy'){
                angle = Math.atan2(-dy, -dx);
            }
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


export function filterEnemies(proba_keep = 0.25) {
    enemies.forEach(enemy => {
        if (enemy.type == 'enemy'){
            let margin = 10;
            if (!(enemy.x - world.x > -margin && enemy.x - world.x < getWidth() + margin && enemy.y - world.y > -margin && enemy.y - world.y < getHeight() + margin)){
                // if (Math.random() > proba_keep){
                //     enemy.stop = true;
                // }
                enemy.stop = true;
            }
        }
    });
}