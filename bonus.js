import { generateNormalRandom, randomBool } from './utils.js';
import { ctx } from './canvas.js';
import { player, invinciblePlayer } from './player.js';
import { world } from './world.js';
import { getGameRunning, restartGame } from './game.js';


// Tableau pour stocker les objets bonus
let bonuses = [];

// Probabilité de bonus
let bonusProb = 0.1;

// dictionnaire de bonus et leur probabilité d'apparition
const bonusTypes = {
    "health": 1  // 50% de chance
    // "speed": 0.3,   // 30% de chance
    // "invincible": 0.2,  // 20% de chance
};

// Fonction pour mettre à jour la position des objets lorsque le monde bouge
export function updateEnemiesPosition(dx, dy) {
    bonuses.forEach(bonus => {
        bonus.x += 2*dx;  // On déplace les bonus de la même quantité que le monde
        bonus.y += 2*dy;
    });
}

// Intervalle de temps pour ajouter une vague d'ennemis (en millisecondes)
export const bonusSpawnInterval = 1000;  // 1 seconde

// Rayon minimal et maximal autour du joueur où les ennemis peuvent apparaître
const bonusSpawnRadius = {
    min: 300,
    max: 500
};


export function spawnBonus() {
    if (!getGameRunning()) {
        bonuses = [];  // Efface tous les bonus
    }

    if (!randomBool(bonusProb)) {
        return;
    }

    const angle = Math.random() * Math.PI * 2;  // Angle aléatoire
    const distance = Math.random() * (bonusSpawnRadius.max - bonusSpawnRadius.min) + bonusSpawnRadius.min;

    // Coordonnées du nouveau bonus (par rapport à la position du monde)
    const bonusX = player.x + world.x + Math.cos(angle) * distance;
    const bonusY = player.y + world.y + Math.sin(angle) * distance;

    bonuses.push({
        x: bonusX,
        y: bonusY,
        radius: 15,  // Taille des bonus
        color: "green",  // Couleur des bonus
        maxDistance: 1000, // Distance maximale avant que le bonus ne disparaisse
    });
}

// Fonction pour dessiner les bonus
export function drawEnemies() {
    enemies.forEach(enemy => {
    ctx.beginPath();
    ctx.arc(enemy.x - world.x, enemy.y - world.y, enemy.radius, 0, Math.PI * 2);
    ctx.fillStyle = enemy.color;
    ctx.fill();
    ctx.closePath();
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
        if (distance < player.radius + enemy.radius && player.invincible <= 0) {
            player.hp -= enemy.damage;  // Réduit les points de vie du joueur
            if (player.hp <= 0) {
                restartGame();  // Redémarre le jeu si collision
                return false;  // Supprime l'ennemi et arrête le jeu
            }
            invinciblePlayer(0.1);  // Rend le joueur invincible pendant 2 secondes
        }

        if (distance > 0) {
            // Normalisation du vecteur directionnel
            const moveX = (dx / distance) * enemy.speed;
            const moveY = (dy / distance) * enemy.speed;

            // Mise à jour de la position de l'ennemi
            enemy.x += moveX;
            enemy.y += moveY;
        }

        return true;  // Conserve cet ennemi
    });
}