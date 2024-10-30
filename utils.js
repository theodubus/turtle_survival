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

export function getExponentialRandom(lambda) {
    let U = Math.random();
    return -Math.log(1 - U) / lambda;
}

export function getNormalRandom(mean, stdDev) {
    let U1 = Math.random();
    let U2 = Math.random();
    let Z0 = Math.sqrt(-2.0 * Math.log(U1)) * Math.cos(2.0 * Math.PI * U2);
    return Z0 * stdDev + mean;
}

export function getRandomPointInCircle(x, y, r) {
    // Générer un angle aléatoire entre 0 et 2 * pi
    let theta = Math.random() * 2 * Math.PI;
    
    // Générer une distance aléatoire radiale (racine carrée pour uniformité)
    let distance = Math.pow(Math.random(), 0.3) * r;
    
    // Calculer les coordonnées cibles en utilisant les coordonnées polaires
    let x_target = x + distance * Math.cos(theta);
    let y_target = y + distance * Math.sin(theta);

    return [ x_target, y_target ];
}

export function getScale(){
    if (isPhone()){
        return 0.75;
    }
    return 1;
}


export function findTangencyPoints(x_ori, y_ori, x, y, r_x, r_y) {
    const tolerance = 1e-6;
    const maxIterations = 100;
    const points = [];

    // Fonction pour obtenir X_t et Y_t en fonction de theta
    function getPointOnEllipse(theta) {
        return {
            X_t: x + r_x * Math.cos(theta),
            Y_t: y + r_y * Math.sin(theta),
            theta: theta
        };
    }

    // Fonction pour calculer la différence de pente entre la tangente et la droite
    function slopeDifference(theta) {
        const { X_t, Y_t } = getPointOnEllipse(theta);

        // Éviter la division par zéro en vérifiant que X_t n'est pas égal à x_ori
        if (Math.abs(X_t - x_ori) < tolerance) return NaN;

        const slopeLine = (Y_t - y_ori) / (X_t - x_ori);
        const slopeTangent = - (r_x * r_x * Math.sin(theta)) / (r_y * r_y * Math.cos(theta));

        return slopeLine - slopeTangent;
    }

    // Dérivée numérique de slopeDifference pour l'algorithme de Newton
    function slopeDifferenceDerivative(theta) {
        const h = 1e-6;
        return (slopeDifference(theta + h) - slopeDifference(theta)) / h;
    }

    // Méthode de Newton pour trouver les valeurs de theta
    function newtonMethod(thetaInit) {
        let theta = thetaInit;
        for (let i = 0; i < maxIterations; i++) {
            const fTheta = slopeDifference(theta);
            const fPrimeTheta = slopeDifferenceDerivative(theta);

            // Vérification pour éviter NaN en cas de dérivée nulle
            if (isNaN(fTheta) || isNaN(fPrimeTheta) || Math.abs(fPrimeTheta) < tolerance) break;

            theta -= fTheta / fPrimeTheta;

            // Arrêt si la fonction converge
            if (Math.abs(fTheta) < tolerance) break;
        }
        return theta;
    }

    // Trouver les deux solutions de theta autour de PI et 0
    // const theta1 = newtonMethod(Math.PI);     // Solution autour de theta = π
    // const theta2 = newtonMethod(Math.PI / 2);           // Solution autour de theta = 0
    const theta1 = Math.PI;
    const theta2 = 0;

    // Calculer les points de tangence pour les valeurs trouvées de theta
    if (!isNaN(theta1)) points.push(getPointOnEllipse(theta1));
    if (!isNaN(theta2)) points.push(getPointOnEllipse(theta2));

    return points;
}