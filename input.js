import { player } from './player.js';
import { updateWorldPosition } from './world.js';
import { getDirection, getAngle } from './joystick.js';

// Gestion des touches enfoncées
let keysPressed = {};

// Met à jour la position du monde en fonction des touches appuyées
export function updateMovement() {
    let dx = 0;
    let dy = 0;

    const angle = getAngle();

    if (angle) {
        dx = -Math.cos(angle) * player.speed;
        dy = Math.sin(angle) * player.speed;
    }
    else {
        if (keysPressed['ArrowRight'] || keysPressed['d']) {
            dx -= player.speed;
        }
        if (keysPressed['ArrowLeft'] || keysPressed['q']) {
            dx += player.speed;
        }
        if (keysPressed['ArrowUp'] || keysPressed['z']) {
            dy += player.speed;
        }
        if (keysPressed['ArrowDown'] || keysPressed['s']) {
            dy -= player.speed;
        }
        
        if (dx != 0 && dy != 0) {
            // on normalise pour que le deplacement total soit la vitesse du joueur
            const norm = Math.sqrt(dx * dx + dy * dy);
            dx = dx / norm * player.speed;
            dy = dy / norm * player.speed;
        }
    }

    updateWorldPosition(dx, dy);

}

// Met a jour la direction du joueur en fonction des touches appuyées
export function updateDirection() {

    const direction = getDirection();

    if (direction) {
        player.direction = direction;
        return;
    }

    let dx = 0;
    let dy = 0;
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
        dx -= 1;
    }
    if (keysPressed['ArrowLeft'] || keysPressed['q']) {
        dx += 1;
    }
    if (keysPressed['ArrowUp'] || keysPressed['z']) {
        dy += 1;
    }
    if (keysPressed['ArrowDown'] || keysPressed['s']) {
        dy -= 1;
    }

    if (dx == 0 && dy == 0) {
        return;
    }

    const angle = Math.atan2(dy, dx);
    if (angle > -Math.PI / 8 && angle <= Math.PI / 8) {
        player.direction = 'g';
    } else if (angle > Math.PI / 8 && angle <= 3 * Math.PI / 8) {
        player.direction = 'hg';
    } else if (angle > 3 * Math.PI / 8 && angle <= 5 * Math.PI / 8) {
        player.direction = 'h';
    } else if (angle > 5 * Math.PI / 8 && angle <= 7 * Math.PI / 8) {
        player.direction = 'hd';
    } else if (angle > 7 * Math.PI / 8 || angle <= -7 * Math.PI / 8) {
        player.direction = 'd';
    } else if (angle > -7 * Math.PI / 8 && angle <= -5 * Math.PI / 8) {
        player.direction = 'bd';
    } else if (angle > -5 * Math.PI / 8 && angle <= -3 * Math.PI / 8) {
        player.direction = 'b';
    } else if (angle > -3 * Math.PI / 8 && angle <= -Math.PI / 8) {
        player.direction = 'bg';
    }
}

export function updateStatic() {
    if (!player.eating){
        if (!player.currentImage == 0) {
            if (!getDirection() && !keysPressed['ArrowRight'] && !keysPressed['ArrowLeft'] && !keysPressed['ArrowUp'] && !keysPressed['ArrowDown'] && !keysPressed['d'] && !keysPressed['q'] && !keysPressed['z'] && !keysPressed['s']) {
                player.currentImage = 0;
            }
        }
        else {
            if (getDirection() || keysPressed['ArrowRight'] || keysPressed['ArrowLeft'] || keysPressed['ArrowUp'] || keysPressed['ArrowDown'] || keysPressed['d'] || keysPressed['q'] || keysPressed['z'] || keysPressed['s']) {
                player.currentImage = 1;
            }
        }
    }
}


// Gestion des touches du clavier (pression)
export function keyDownHandler(e) {
    keysPressed[e.key] = true;  // Enregistre la touche enfoncée
}

// Gestion des touches du clavier (relâchement)
export function keyUpHandler(e) {
    keysPressed[e.key] = false;  // Supprime la touche lorsqu'elle est relâchée
}