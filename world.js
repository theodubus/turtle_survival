import { ctx, getHeight, getWidth } from './canvas.js';
import { updateEnemiesPosition } from './elements.js';
import { updateTargets } from "./projecteur.js";

// Coordonnées du monde (représente le déplacement dans l'aire infinie)
export let world = {
    x: 0,   // Coordonnées du "monde" (ce qui entoure le joueur)
    y: 0
};

// Charger l'image de fond
export let backgroundImage = new Image();
backgroundImage.src = 'assets/ground.jpeg';  // Chemin vers votre image de fond

export function changeBackgroundImage(newImage) {
    backgroundImage.src = newImage;
}

// // Fonction pour dessiner l'arrière-plan (ici on dessine une grille simple)
// export function drawWorld() {
//     let x = Math.round(world.x);
//     let y = Math.round(world.y);
//     ctx.drawImage(backgroundImage, x % getWidth(), y % getHeight() - getHeight(), getWidth(), getHeight()); // image du haut
//     ctx.drawImage(backgroundImage, x % getWidth() + getWidth(), y % getHeight() - getHeight(), getWidth(), getHeight()); // image du haut droite
//     ctx.drawImage(backgroundImage, x % getWidth() - getWidth(), y % getHeight() - getHeight(), getWidth(), getHeight()); // image du haut gauche
//     ctx.drawImage(backgroundImage, x % getWidth(), y % getHeight(), getWidth(), getHeight()); // image du centre
//     ctx.drawImage(backgroundImage, x % getWidth() - getWidth(), y % getHeight(), getWidth(), getHeight()); // image de gauche
//     ctx.drawImage(backgroundImage, x % getWidth(), y % getHeight() + getHeight(), getWidth(), getHeight()); // image du bas
//     ctx.drawImage(backgroundImage, x % getWidth() + getWidth(), y % getHeight(), getWidth(), getHeight()); // image de droite
//     ctx.drawImage(backgroundImage, x % getWidth() + getWidth(), y % getHeight() + getHeight(), getWidth(), getHeight()); // image du bas droite
//     ctx.drawImage(backgroundImage, x % getWidth() - getWidth(), y % getHeight() + getHeight(), getWidth(), getHeight()); // image du bas gauche



//     // const gridSize = 2;  // Taille des cases de la grille
//     // ctx.strokeStyle = "lightgray";

//     // // Dessin de la grille autour du joueur
//     // for (let x = (world.x % gridSize) - gridSize; x < getWidth(); x += gridSize) {
//     //     for (let y = (world.y % gridSize) - gridSize; y < getHeight(); y += gridSize) {
//     //         ctx.strokeRect(x, y, gridSize, gridSize);
//     //     }
//     // }
// }

export function createRadialGradient() {
    // Coordonnées du centre du canvas
    const centerX = getWidth() / 2;
    const centerY = getHeight() / 2;

    // Rayon du centre et rayon du bord pour le dégradé
    const innerRadius = 0;
    const outerRadius = Math.max(getWidth(), getHeight()) / 2;

    // Crée un dégradé radial
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);

    // Définition des couleurs : totalement transparent au centre, noir semi-transparent sur les bords
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');  // Centre transparent
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)'); // Bords semi-transparents

    // Applique le dégradé pour remplir tout le canvas
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, getWidth(), getHeight());
}


// Fonction pour dessiner l'arrière-plan sans déformer l'image
export function drawWorld() {
    let x = Math.round(world.x);
    let y = Math.round(world.y);

    // Dimensions du canvas
    const canvasWidth = getWidth();
    const canvasHeight = getHeight();

    // Dimensions originales de l'image
    const imgWidth = backgroundImage.width;
    const imgHeight = backgroundImage.height;

    // Calculer le facteur d'échelle pour garder les proportions
    const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);

    // Dimensions redimensionnées de l'image
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Calculer les nouvelles positions avec redimensionnement
    const xOffset = x % scaledWidth;
    const yOffset = y % scaledHeight;

    let nb_y = Math.ceil(canvasHeight / scaledHeight);
    let nb_x = Math.ceil(canvasWidth / scaledWidth);

    nb_x = 2 + Math.ceil(nb_x / 2) * 2;
    nb_y = 2 + Math.ceil(nb_y / 2) * 2;

    // Dessiner les 9 images pour remplir la grille infinie
    for (let i = -nb_x; i <= nb_x; i++) {
        for (let j = -nb_y; j <= nb_y; j++) {
            ctx.drawImage(
                backgroundImage,
                xOffset + i * scaledWidth,
                yOffset + j * scaledHeight,
                scaledWidth,
                scaledHeight
            );
        }
    }

}



// Fonction pour mettre à jour la position du monde (déplacement du monde)
export function updateWorldPosition(dx, dy) {
    world.x += dx;
    world.y += dy;

    // Met à jour aussi la position des ennemis
    updateEnemiesPosition(dx, dy);
    updateTargets(dx, dy);
}