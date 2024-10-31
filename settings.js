const mySettings = {
    // scale : scale factor for the radius of the entities and the player
    desktopScale: 1,
    phoneScale: 0.75,

    // dividerRadius : divider of the radius for spawning range and max distance
    destopDividerRadius: 1,
    phoneDividerRadius: 1.8,

    // font
    font: "20px Arial",

    // pinRadius : radius of the pin that indicates far away entities
    desktopPinRadius: 25,
    phonePinRadius: 21,
    pinFirstColor: "rgba(255, 255, 255, 0.6)",
    pinSecondColor: "rgba(0, 0, 0, 0.2)",

    // how the score is calculated
    score: {
        timeFactor: 5,
        killCountFactor: 2,
    },

    // data about the projectors in ghost mode
    projector: {
        meanYori: -400,
        stdYori: 20,
        ellipsisMeanRx: 100,
        ellipsisStdRx: 10,
        sizeReductionFactor: 0.75, // reduction of the ellipsis when phone
        playerSpeedRatio: 0.8,
    },

    // data about the player
    player: {
        desktopSpeed: 75,
        phoneSpeed: 55,
        maxHp: 10,
        maxGhostHp: 10,
        baseAnimationSpeed: 35, // in milliseconds
        bouleAnimationSpeed: 70, // in milliseconds
        ghostAnimationSpeed: 110, // in milliseconds
        radius: 30, // radius (size)
        ghostScaleMultiplier: 1.05, // scale multiplier when ghost mode is activated
    },

    // data about entities
    entities: {
        baseTolerance: 1.5, // tolerance for the entities to be considered touching the player
        ghostTolerance: 1.3, // tolerance for the entities to be considered touching the player when ghost mode is activated
        enemySpawnInterval: 8500, // in milliseconds
        maxEnemiesPerWave: 80, // max number of enemies per wave
        ghostMultiplier: 4, // Multiplier for the number of enemies per wave when ghost mode is activated
        renderMargin: 50, // in pixels, margin around the canvas where entities are rendered
        star: {
            max: 1, // max number of stars at once
            meanSpawnRate: 30, // in seconds
            meanSpawnRateReduction: 5, // in seconds
            meanGhostSpawnRate: 45, // in seconds
            ghostInitStarDistance: 150, // in pixels
            stdSpawnRate: 5, // in seconds
            minimumWaitTime: 10000, // in milliseconds
            animationSpeed: 90, // in milliseconds
            speed: 1, // not 0 for position calculation
            damage: 0,
            radius: 18, // radius (size)
            heightMultiplier: 1,
            maxDistance: 3, // times max between width and height of the canvas
            speedDuration: 15, // in seconds, time the player speed is increased when ghost mode is activated
            invincibleDuration: 10, // in seconds, time the player is invincible (no ghost mode)
            speedMultiplier: 2.8, // speed multiplier
            speedMultiplierGhost: 2.8, // speed multiplier
        },
        ghost: {
            max: 1, // max number of ghosts at once
            meanSpawnRate: 60, // in seconds
            meanSpawnRateReduction: 15, // in seconds
            firstSpawnAddition: 30, // in seconds
            stdSpawnRate: 7.5, // in seconds
            animationSpeed: 110, // in milliseconds
            playerSpeedRatio: 1.15,
            damage: 0,
            radius: 20, // radius (size)
            heightMultiplier: 1,
            maxDistance: 3, // times max between width and height of the canvas
            reduceScale: 1.2, // scale reduction of the entities when ghost mode is activated
            walkRadius: 150, // in pixels, radius of the circle where ghosts can walk
            speedMultiplier: 1.3, // speed multiplier of the player when ghost mode is activated
        },
        food: {
            max: 3, // max number of food at once
            meanSpawnRate: 30, // in seconds
            meanSpawnRateReduction: 10, // in seconds
            stdSpawnRate: 5, // in seconds
            animationSpeed: 90, // in milliseconds
            playerSpeedRatio: 0.8,
            damage: 3,
            radius: 15, // radius (size)
            heightMultiplier: 1.3,
            maxDistance: 3, // times max between width and height of the canvas
            walkRadius: 75, // in pixels, radius of the circle where food can walk
        },
        enemy: {
            // speed is defined as follow:
            // let speedEnemy = N(meanSpeedRatio * playerSpeed, stdSpeedRatio * playerSpeed)
            // speedEnemy = Math.max(minSpeedRatio * playerSpeed, Math.min(maxSpeedRatio * playerSpeed, speedEnemy))
            // currentEnemySpeed = speedEnemy * (currentGameDifficulty() + 2)/3
            minPlayerSpeedRatio: 0.3,
            maxPlayerSpeedRatio: 0.8,
            meanPlayerSpeedRatio: 0.5,
            stdPlayerSpeedRatio: 0.2,
            damage: 1,
            radius: 18, // radius (size)
            heightMultiplier: 1.3,
            maxDistance: 2.3, // times max between width and height of the canvas
            animationSpeed: 90, // in milliseconds
            killPoints: 1, // number of points added to the score when killed
        },
        greenEnemy: {
            animationSpeed: 75, // in milliseconds
            heightAddition: 0.3, // addition to the height of the entity in reference to normal enemies
            killPoints: 3, // number of points added to the score when killed
        }
    }
};

export function getSettings(){
    return mySettings;
}
