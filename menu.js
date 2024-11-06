import { canvas, ctx, getHeight, getWidth } from "./canvas.js";
import { isPhone, drawRoundedRect, isInsideRect } from "./utils.js";
import { drawWorld } from "./world.js";
import { getStage, changeStage } from "./game.js";
import { player } from "./player.js";

const customFont = new FontFace('customFont', 'url(./fonts/Crushed-y4Ad.ttf)');
customFont.load().then(function(loadedFont) {
    document.fonts.add(loadedFont);
    // console.log("Font loaded and available for use.");
}).catch(function(error) {
    console.error("Failed to load font:", error);
});


const upImages = [];
const numImages = 6;

for (let i = 0; i < numImages; i++) {
    upImages.push(new Image());
    upImages[i].src = `./assets/player_up/b_${i + 1}.png`;
}


let leaderboardRect = {
    x: getWidth() / 8 - 5,
    y: 39*getHeight()/48,
    width: getWidth() - getWidth() / 4,
    height: 70,
    isHovered: false
}

let playRect = {
    x: getWidth() / 8 - 5,
    y: 32*getHeight()/48,
    width: getWidth() - getWidth() / 4,
    height: 70,
    isHovered: false
}

export function drawMenu() {
    drawWorld();
    let maxWidth = getWidth() * 0.9; // largeur maximum autorisée (90% de la largeur de l'écran)
    let fontSize = 50; // taille de police de départ
    ctx.font = `${fontSize}px customFont`;
    // ctx.fillStyle = "rgb(40, 61, 222)";
    ctx.fillStyle = "rgb(245, 245, 220)";
    ctx.textAlign = "center";

    // Réduire la taille de police tant que le texte dépasse la largeur maximale
    while (ctx.measureText("Turtle Survival").width > maxWidth) {
        fontSize -= 1;
        ctx.font = `${fontSize}px customFont`;
    }

    ctx.fillText("Turtle Survival", getWidth() / 2, getHeight() / 6);

    ctx.fillStyle = leaderboardRect.isHovered ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)";
    drawRoundedRect(ctx, leaderboardRect.x, leaderboardRect.y, leaderboardRect.width, leaderboardRect.height, 10); // rayon de 10 pour arrondir les bords
    ctx.fill();

    fontSize = 25;
    ctx.font = "25px customFont";
    maxWidth = leaderboardRect.width * 0.9;
    while (ctx.measureText("Leaderboard").width > maxWidth) {
        fontSize -= 1;
        ctx.font = `${fontSize}px customFont`;
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Leaderboard", leaderboardRect.x + leaderboardRect.width / 2, leaderboardRect.y + leaderboardRect.height / 2);

    // Bouton Resume
    ctx.fillStyle = playRect.isHovered ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.7)";
    drawRoundedRect(ctx, playRect.x, playRect.y, playRect.width, playRect.height, 10); // rayon de 10 pour arrondir les bords
    ctx.fill();

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillText("Play", playRect.x + playRect.width / 2, playRect.y + playRect.height / 2);


    // Affichage image 0 au centre de l'écran
    const image = upImages[0];
    let scale = player.radius*2;
    const width = scale;
    const height = scale;

    ctx.drawImage(
        image, // Image à dessiner
        player.x - width / 2, // Centrer l'image horizontalement
        player.y - height / 2, // Centrer l'image verticalement
        width, // Largeur
        height // Hauteur
    );
}

export function drawTransition(frame) {
    if (frame < 0) {
        frame = 0;
    }
    if (frame > numImages - 1) {
        frame = numImages - 1;
    }

    drawWorld();

    // Affichage image 0 au centre de l'écran
    const image = upImages[frame];
    let scale = player.radius*2;
    const width = scale;
    const height = scale;

    ctx.drawImage(
        image, // Image à dessiner
        player.x - width / 2, // Centrer l'image horizontalement
        player.y - height / 2, // Centrer l'image verticalement
        width, // Largeur
        height // Hauteur
    );

    if (frame == numImages - 1) {
        changeStage("game");
    }

}
    


function drawLeaderBoard(){
    let leaderboard = [
        ["Leaderboard", 100],
        ["will", 100],
        ["be", 100],
        ["available", 100],
        ["here", 100],
        ["soon", 100],
    ];

    // Variables d'affichage
    let screenWidth = getWidth();
    let screenHeight = getHeight();
    let fontSize = 20;
    ctx.fillStyle = "black";

    // Détermine la largeur fixe du leaderboard en fonction de l'appareil
    let leaderboardWidthFactor = isPhone() ? 0.8 : 0.6; // 80% pour téléphone, 60% sinon

    // Affiche le titre "Top Players" en gras et centré
    ctx.font = "bold 24px Arial"; // Police en gras pour le titre
    ctx.textAlign = "center"; // Centre le texte
    ctx.fillText("Top Players", screenWidth / 2, screenHeight / 4 - 40);

    // Hauteur du leaderboard pour occuper la moitié de l'écran
    let leaderboardHeight = screenHeight / 2;
    let lineHeight = leaderboardHeight / 10;
    let startY = (screenHeight - leaderboardHeight) / 2 + lineHeight / 2; // Centré verticalement

    // Définit les positions de chaque partie
    let leaderboardWidth = screenWidth * leaderboardWidthFactor;
    let rankX = (screenWidth - leaderboardWidth) / 2;   // Position du classement en fonction de la largeur du leaderboard
    let nameX = rankX + 40;                             // Position du nom
    let scoreX = rankX + leaderboardWidth;              // Position du score, aligné à droite

    for (let i = 0; i < 10; i++) {
        let name, score;
        let rank = (i + 1) + ".";
        if (i >= leaderboard.length){
            name = "";
            score = "0";
        }
        else{
            name = leaderboard[i][0];
            score = leaderboard[i][1];
        }

        // Calcule la position verticale pour chaque ligne
        let yPosition = startY + i * lineHeight;

        // Configure la police et l'alignement pour le leaderboard
        ctx.font = fontSize + "px Arial"; // Remet la police normale pour le leaderboard
        ctx.textAlign = "left"; // Aligne à gauche pour le classement et le nom

        // Affiche le classement
        ctx.fillText(rank, rankX, yPosition);

        // Affiche le nom avec une ligne de points pour séparer du score
        let line = `${name}`;
        while (ctx.measureText(line + " . " + score).width < scoreX - nameX - 10) {
            line += " .";
        }
        ctx.fillText(line, nameX, yPosition);

        // Affiche le score, aligné à droite
        ctx.textAlign = "right";
        ctx.fillText(score, scoreX, yPosition);

        // Réinitialise l'alignement pour les prochaines lignes
        ctx.textAlign = "left";
    }
}


canvas.addEventListener("mousemove", (event) => {
    const rectCanvas = canvas.getBoundingClientRect();
    const x = event.clientX - rectCanvas.left;
    const y = event.clientY - rectCanvas.top;

    // Vérifie si la souris est dans le rectangle
    const hoverStatePlay = isInsideRect(x, y, playRect);
    const hoverStateLeaderboard = isInsideRect(x, y, leaderboardRect);

    // Met à jour l'état `isHovered` et redessine si l'état change
    if (hoverStatePlay !== playRect.isHovered && getStage()=="menu") {
        playRect.isHovered = hoverStatePlay;
    }

    if (hoverStateLeaderboard !== leaderboardRect.isHovered && getStage()=="menu") {
        leaderboardRect.isHovered = hoverStateLeaderboard;
    }
});

canvas.addEventListener("click", (event) => {
    const rectCanvas = canvas.getBoundingClientRect();
    const x = event.clientX - rectCanvas.left;
    const y = event.clientY - rectCanvas.top;

    if (isInsideRect(x, y, playRect) && getStage()=="menu") {
        changeStage("transition");
    }

    if (isInsideRect(x, y, leaderboardRect) && getStage()=="menu") {
        console.log("leaderboard");
    }
});