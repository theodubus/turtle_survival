export function generateNormalRandom(mean, stdDev) {
    let u1 = Math.random(); // Un nombre aléatoire entre 0 et 1
    let u2 = Math.random(); // Un autre nombre aléatoire entre 0 et 1
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Maintenant on applique la transformation pour obtenir la distribution normale souhaitée
    return z0 * stdDev + mean;
}

// Fonction qui retourne true ou false, avec true à une probabilité de p
export function randomBool(p) {
    return Math.random() < p;
}

// Fonction qui dit si l'utilisateur est sur un téléphone ou non
export function isPhone() {
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isMobile && isTouch;
}