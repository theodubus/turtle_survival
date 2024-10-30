import { ctx, getHeight, getWidth } from "./canvas.js";
import { player, deactivateGhost } from "./player.js";
import { world } from "./world.js";
import { generateNormalRandom, findTangencyPoints } from "./utils.js";

let projecteurs = []
let baseSpeed = 1;
let thetaError = Math.PI;
let maxProjecteurs = 1;


export function getProjecteurs(){
    return projecteurs;
}

function increaseDifficulty(speedIncrease = 0.04, thetaMuliplier = 0.98){
    baseSpeed += speedIncrease;
    thetaError *= thetaMuliplier;

    if (maxProjecteurs < 3){
        maxProjecteurs += 0.35;
    }
}

export function addProjecteur(){
    if (projecteurs.length >= Math.floor(maxProjecteurs)){
        increaseDifficulty();
        return;
    }
    else {
        increaseDifficulty(0.015, 0.99);

        let x_ref = player.x - world.x;
        let y_ref = player.y - world.y;

        let ellipsis_rx = generateNormalRandom(100, 10);
        let ellipsis_ry = ellipsis_rx / 3;

        let r = Math.max(getWidth(), getHeight()) / 2 + ellipsis_rx;
        let theta = Math.random() * 2 * Math.PI;

        let x = x_ref + r * Math.cos(theta);
        let y = y_ref + r * Math.sin(theta);

        let x_ori = Math.random() * (getWidth() * (6/5)) - getWidth()/10;
        let y_ori = generateNormalRandom(-400, 20);

        projecteurs.push({
            x_ori: x_ori,
            y_ori: y_ori,
            x: x,
            y: y,
            r_x: ellipsis_rx,
            r_y: ellipsis_ry,
            pauseUntil: 0,
            target_X: undefined,
            target_Y: undefined,
            old_Target_X: x,
            old_Target_Y: y,
            speed: 1, 
        });
    }
}

export function emptyProjecteurs(){
    projecteurs = [];
    baseSpeed = 1;
    thetaError = Math.PI;
    maxProjecteurs = 1;
}

export function drawProjecteur(projecteur){
    let x_ori = projecteur.x_ori;
    let y_ori = projecteur.y_ori;
    let x = projecteur.x + world.x;
    let y = projecteur.y + world.y;
    let r_x = projecteur.r_x;
    let r_y = projecteur.r_y;
    
    let points = findTangencyPoints(x_ori, y_ori, x, y, r_x, r_y);
    let Xt1 = points[0].X_t;
    let Yt1 = points[0].Y_t;
    let Xt2 = points[1].X_t;
    let Yt2 = points[1].Y_t;
    let theta1 = points[0].theta;
    let theta2 = points[1].theta;

    let color = "rgba(255, 255, 150, 0.3)";   
    // let secondColor = "rgba(0, 0, 0, 0.2)";

    // // Dessine la pointe du "pin" (un petit triangle pointant vers x, y)
    ctx.beginPath();
    ctx.moveTo(Xt1, Yt1);
    ctx.lineTo(
        x_ori,
        y_ori
    );
    ctx.lineTo(
        Xt2,
        Yt2
    );
    // ctx.stroke();

    // ctx.beginPath();

    ctx.ellipse(x, y, r_x, r_y, 0, theta1, theta2, true);


    ctx.closePath();
    ctx.fillStyle = color;  // Couleur de la pointe
    ctx.fill();
}

export function drawProjecteurBase(projecteur){
    let color = "rgba(255, 255, 150, 0.25)";
    let x = projecteur.x + world.x;
    let y = projecteur.y + world.y;
    let r_x = projecteur.r_x;
    let r_y = projecteur.r_y;
    ctx.beginPath();
    ctx.ellipse(x, y, r_x, r_y, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;  // Couleur transparente
    ctx.fill();
}


export function projectorDamage(){
    for (let i = 0; i < projecteurs.length; i++) {
        // check if player coordinates are inside the ellipse
        let r_x = projecteurs[i].r_x;
        let r_y = projecteurs[i].r_y;

        let x = player.x;
        let y = player.y;
        let center_x = projecteurs[i].x + world.x;
        let center_y = projecteurs[i].y + world.y - r_y/2;


        if (Math.pow(x - center_x, 2) / Math.pow(r_x, 2) + Math.pow(y - center_y, 2) / Math.pow(r_y, 2) <= 1){
            if (projecteurs[i].pauseUntil < Date.now()){
                player.ghostHp -= 1;
                projecteurs[i].pauseUntil = Date.now() + 250;

                if (player.ghostHp <= 0){
                    deactivateGhost();
                }
            }
        }
    }
}

export function updateTargets(dx, dy){
    projecteurs.forEach(projecteur => {
        let distanceToPlayer = Math.sqrt(
            Math.pow((player.x - world.x) - projecteur.x, 2) +
            Math.pow((player.y - world.y) - projecteur.y, 2)
        );
        if (distanceToPlayer > 3*Math.max(getHeight(), getWidth())/4 && !isNaN(projecteur.target_X) && !isNaN(projecteur.target_Y)){
            projecteur.target_X -= dx;
            projecteur.target_Y -= dy;
        }
    });
}

export function updateProjecteurs(){
    projecteurs.forEach(projecteur => {
        let distance_to_target = 0;
        // let slowFactor = 1;
        if (projecteur.target_X == undefined){
            let x_ref = player.x - world.x;
            let y_ref = player.y - world.y;
            let dx_player = x_ref - projecteur.x;
            let dy_player = y_ref - projecteur.y; 
            distance_to_target = Math.sqrt(
                Math.pow(projecteur.target_X - projecteur.x, 2) +
                Math.pow(projecteur.target_Y - projecteur.y, 2)
            );

            let r = Math.max(0, generateNormalRandom(160, 40));
            let theta = Math.atan2(dy_player, dx_player) + (Math.random() - 0.5) * thetaError;

            projecteur.target_X = x_ref + r * Math.cos(theta);
            projecteur.target_Y = y_ref + r * Math.sin(theta);

        }
        distance_to_target = Math.sqrt(
            Math.pow(projecteur.target_X - projecteur.x, 2) +
            Math.pow(projecteur.target_Y - projecteur.y, 2)
        );
        if (distance_to_target < 5){
            projecteur.old_Target_X = projecteur.target_X;
            projecteur.old_Target_Y = projecteur.target_Y;
            projecteur.target_X = undefined;
            projecteur.target_Y = undefined;
            return;
        }

        // let distance_to_old_target = Math.sqrt(
        //     Math.pow(projecteur.old_Target_X - projecteur.x, 2) +
        //     Math.pow(projecteur.old_Target_Y - projecteur.y, 2)
        // );
    
        // let distance = Math.min(distance_to_target, distance_to_old_target);
        // if (distance < 100){
        //     slowFactor = Math.min(((distance) / 70) + 0.1, 1);
        // }

        if (projecteur.target_X != undefined){
            let dx = projecteur.target_X - projecteur.x;
            let dy = projecteur.target_Y - projecteur.y;
            let norm = Math.sqrt(dx * dx + dy * dy);
            dx = dx / norm * 2;
            dy = dy / norm * 2;
            projecteur.x += dx * projecteur.speed;// * slowFactor;
            projecteur.y += dy * projecteur.speed;// * slowFactor;
        }


        let distanceToPlayer = Math.sqrt(
            Math.pow((player.x - world.x) - projecteur.x, 2) +
            Math.pow((player.y - world.y) - projecteur.y, 2)
        );
        if (distanceToPlayer > 3*Math.max(getHeight(), getWidth())/4){
            projecteur.speed = 3.5;
        }
        else {
            projecteur.speed = baseSpeed;
        }

        // rapprocher l'origine du projecteur de sa position actuelle
        if (Math.abs(projecteur.x_ori - projecteur.x) > 1){
            if (projecteur.x_ori < projecteur.x + world.x){
                projecteur.x_ori += 0.5;
            }
            else {
                projecteur.x_ori -= 0.5;
            }
        }

        return;
    });
}