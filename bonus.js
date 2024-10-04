import { generateNormalRandom } from './utils.js';
import { ctx, getHeight, getWidth } from './canvas.js';
import { player, invinciblePlayer } from './player.js';
import { world } from './world.js';
import { getGameRunning, startGame, restartGame, setStartTime } from './game.js';

// Tableau pour stocker les ennemis
let enemies = [];

// Fonction pour mettre à jour la position des ennemis lorsque le monde bouge
export function updateEnemiesPosition(dx, dy) {
    enemies.forEach(enemy => {
        enemy.x += 2*dx;  // On déplace l'ennemi de la même quantité que le monde
        enemy.y += 2*dy;
    });
}

// Intervalle de temps pour ajouter une vague d'ennemis (en millisecondes)
export const enemySpawnInterval = 10000;

// Rayon minimal et maximal autour du joueur où les ennemis peuvent apparaître
const enemySpawnRadius = {
    min: Math.round(Math.max(getWidth(), getHeight())/1.5) + 20,
    max: Math.round(Math.max(getWidth(), getHeight())/1.5) + 120,
};

// Tableau pour stocker les identifiants de setTimeout des vagues d'ennemis
let enemyTimeouts = [];

// Fonction pour générer une vague d'ennemis, 10 par defaut, sinon n (parametre)
export function waveEnemy(n = 40) {
    for (let i = 0; i < n; i++) {
    // wait 1 second before spawning the next enemy
    const timeoutId = setTimeout(spawnEnemy, i * 100);
    enemyTimeouts.push(timeoutId); // Stocker l'identifiant du setTimeout
    }
}

// Fonction pour réinitialiser les vagues en cours
export function clearEnemyTimeouts() {
  enemyTimeouts.forEach(timeoutId => clearTimeout(timeoutId)); // Annuler tous les setTimeout
  enemyTimeouts = [];  // Réinitialiser le tableau
}


export function spawnEnemy() {
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
    let speedEnemy = Math.max(0.3 * playerSpeed, Math.min(0.7 * playerSpeed, generateNormalRandom(0.4 * playerSpeed, 0.2 * playerSpeed)));  // Vitesse de déplacement

    enemies.push({
        x: enemyX,
        y: enemyY,
        radius: 18,  // Taille des ennemis
        heightMultiplier: 1.3,  // Multiplie la taille de l'ennemi
        color: "red",  // Couleur des ennemis
        // vitesse de deplacement suit une loi normale de moyenne 1.5 et d'écart type 0.5, avec un minimum de 0.5 et un maximum de 2.5
        speed: speedEnemy, // Vitesse de déplacement
        maxDistance: Math.round(Math.max(getWidth(), getHeight())*1.5), // Distance maximale avant que l'ennemi ne disparaisse
        damage: 1,  // Dégâts infligés au joueur
        animationSpeed: 90,  // Vitesse de l'animation
        currentImage: 1,  // Image actuelle de l'ennemi
        direction: 'b',  // Dernière direction de l'ennemi
        lastChange: Date.now()  // Dernier changement d'image
    });
}

// Directions disponibles
const directions = ['h', 'hg', 'hd', 'b', 'bg', 'bd', 'g', 'd'];
const numImages = 8; // Nombre d'images par direction (de 0 à 7)

// Objet pour stocker les images par direction
const enemyImages = {};

// Charger les images pour chaque direction
directions.forEach(direction => {
    enemyImages[direction] = []; // Créer un tableau pour chaque direction
    for (let i = 1; i <= numImages; i++) {
        const img = new Image();
        img.src = `assets/enemy/${direction}_${i}.png`; // Nom du fichier d'image
        enemyImages[direction].push(img); // Ajouter l'image au tableau de la direction
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

        ctx.drawImage(
            enemyImages[enemy.direction][enemy.currentImage],
            enemy.x - world.x - width / 2, // Position X (centre l'image)
            enemy.y - world.y - height / 2, // Position Y (centre l'image)
            width, // Largeur
            height // Hauteur
        );

        // temps depuis lequel on a changé l'image
        const timeSinceChange = Date.now() - enemy.lastChange;
        if (timeSinceChange > enemy.animationSpeed) {
            // Mettez à jour l'index de l'image actuelle, max entre 1 et le resultat 
            enemy.currentImage = Math.max(1, (enemy.currentImage + 1) % numImages);
            enemy.lastChange = Date.now();
        }
    });
}


// Fonction pour mettre à jour la position des ennemis (ils se dirigent vers le joueur)
export function updateEnemies() {
    enemies = enemies.filter(enemy => {
        const dx = player.x + world.x - enemy.x;  // Distance horizontale entre l'ennemi et le joueur
        const dy = player.y + world.y - enemy.y;  // Distance verticale entre l'ennemi et le joueur
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Si l'ennemi est trop loin, on l'enlève
        if (distance > enemy.maxDistance) {
            return false;  // Supprime cet ennemi
        }

        // Détection de collision entre le joueur et l'ennemi
        const tolerance = 1.5; // pour ne pas enlever de la vie si l'ennemi effleure juste le joueur
        if (tolerance*distance < player.radius + enemy.radius && player.invincible <= 0) {
            player.hp -= enemy.damage;  // Réduit les points de vie du joueur
            if (player.hp <= 0) {
                restartGame();  // Redémarre le jeu si collision
                return false;  // Supprime l'ennemi et arrête le jeu
            }
            invinciblePlayer(0.15);  // Rend le joueur invincible pendant 2 secondes
        }

        if (distance > 0) {
            // Normalisation du vecteur directionnel
            const moveX = (dx / distance) * enemy.speed;
            const moveY = (dy / distance) * enemy.speed;

            // Mise à jour de la position de l'ennemi
            enemy.x += moveX;
            enemy.y += moveY;

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