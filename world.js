import { ctx, getHeight, getWidth } from './canvas.js';
import { updateEnemiesPosition } from './elements.js';

// Coordonnées du monde (représente le déplacement dans l'aire infinie)
export let world = {
    x: 0,   // Coordonnées du "monde" (ce qui entoure le joueur)
    y: 0
};

// Charger l'image de fond
const backgroundImage = new Image();
backgroundImage.src = 'assets/ground.jpeg';  // Chemin vers votre image de fond


// Fonction pour dessiner l'arrière-plan (ici on dessine une grille simple)
export function drawWorld() {
    let x = Math.round(world.x);
    let y = Math.round(world.y);
    ctx.drawImage(backgroundImage, x % getWidth(), y % getHeight() - getHeight(), getWidth(), getHeight()); // image du haut
    ctx.drawImage(backgroundImage, x % getWidth() + getWidth(), y % getHeight() - getHeight(), getWidth(), getHeight()); // image du haut droite
    ctx.drawImage(backgroundImage, x % getWidth() - getWidth(), y % getHeight() - getHeight(), getWidth(), getHeight()); // image du haut gauche
    ctx.drawImage(backgroundImage, x % getWidth(), y % getHeight(), getWidth(), getHeight()); // image du centre
    ctx.drawImage(backgroundImage, x % getWidth() - getWidth(), y % getHeight(), getWidth(), getHeight()); // image de gauche
    ctx.drawImage(backgroundImage, x % getWidth(), y % getHeight() + getHeight(), getWidth(), getHeight()); // image du bas
    ctx.drawImage(backgroundImage, x % getWidth() + getWidth(), y % getHeight(), getWidth(), getHeight()); // image de droite
    ctx.drawImage(backgroundImage, x % getWidth() + getWidth(), y % getHeight() + getHeight(), getWidth(), getHeight()); // image du bas droite
    ctx.drawImage(backgroundImage, x % getWidth() - getWidth(), y % getHeight() + getHeight(), getWidth(), getHeight()); // image du bas gauche



    // const gridSize = 2;  // Taille des cases de la grille
    // ctx.strokeStyle = "lightgray";

    // // Dessin de la grille autour du joueur
    // for (let x = (world.x % gridSize) - gridSize; x < getWidth(); x += gridSize) {
    //     for (let y = (world.y % gridSize) - gridSize; y < getHeight(); y += gridSize) {
    //         ctx.strokeRect(x, y, gridSize, gridSize);
    //     }
    // }
}

// Fonction pour mettre à jour la position du monde (déplacement du monde)
export function updateWorldPosition(dx, dy) {
    world.x += dx;
    world.y += dy;

    // Met à jour aussi la position des ennemis
    updateEnemiesPosition(dx, dy);
}