import { ctx, canvas } from './canvas.js';
import { gameDifficulty } from "./game.js";

const pi = Math.PI;

var positions = {
  // Here, fixed is the outer circle and inner is the small circle that moves
    fixedX: undefined,
    fixedY: undefined,
    innerX: undefined,
    innerY: undefined
};

var angle = undefined;

export function getDirection() {
    if (angle === undefined) return undefined;
    var radianAngle = -angle;

    if (radianAngle > -Math.PI / 8 && radianAngle <= Math.PI / 8) {
        return 'd';
    } else if (radianAngle > Math.PI / 8 && radianAngle <= 3 * Math.PI / 8) {
        return 'hd';
    } else if (radianAngle > 3 * Math.PI / 8 && radianAngle <= 5 * Math.PI / 8) {
        return 'h';
    } else if (radianAngle > 5 * Math.PI / 8 && radianAngle <= 7 * Math.PI / 8) {
        return 'hg';
    } else if (radianAngle > 7 * Math.PI / 8 || radianAngle <= -7 * Math.PI / 8) {
        return 'g';
    } else if (radianAngle > -7 * Math.PI / 8 && radianAngle <= -5 * Math.PI / 8) {
        return 'bg';
    } else if (radianAngle > -5 * Math.PI / 8 && radianAngle <= -3 * Math.PI / 8) {
        return 'b';
    } else if (radianAngle > -3 * Math.PI / 8 && radianAngle <= -Math.PI / 8) {
        return 'bd';
    }
}

export function getAngle() {
    if (angle === undefined) return undefined
    return -angle;
}

function touchStart(x, y) {
    if (positions.fixedX || positions.fixedY) return;
    positions.fixedX = positions.innerX = x;
    positions.fixedY = positions.innerY = y;
}

function touchMove(x, y) {
    if (!(positions.fixedX || positions.fixedY)) return;
    
    positions.innerX = x;
    positions.innerY = y;

    angle = Math.atan2(
        positions.innerY - positions.fixedY,
        positions.innerX - positions.fixedX
    );

    // If inner circle is outside joystick radius, reduce it to the circumference
    if (!(
        (x - positions.fixedX) ** 2 +
        (y - positions.fixedY) ** 2 < 50 ** 2
        ))
    {
        positions.innerX = Math.round(Math.cos(angle) * 50 + positions.fixedX);
        positions.innerY = Math.round(Math.sin(angle) * 50 + positions.fixedY);
    }
}

function touchEndOrCancel() {
    positions.fixedX
    = positions.fixedY
    = positions.innerX
    = positions.innerY
    = angle
    = undefined;
}

canvas.addEventListener("touchstart", function(e) {
    touchStart(e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener("touchmove", function(e) {
    touchMove(e.touches[0].clientX, e.touches[0].clientY)
});

canvas.addEventListener("touchend", touchEndOrCancel);
canvas.addEventListener("touchcancel", touchEndOrCancel);

// TODO: test mouse on pc
canvas.addEventListener("mousedown", function (e) {
    touchStart(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", function (e) {
    touchMove(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", touchEndOrCancel);

export function renderJoystick() {
    // Invert Y axis and turn into positive
    // var displayAngle = -angle; //(-angle + 2*pi) % (2*pi);
    
    // ctx.fillStyle = "#0008";
    // if (!(positions.fixedX || positions.fixedY)) {
    //     return;
    // };
    
    // // Display data
    // ctx.fillText(
    //     `Angle: ${Math.round((displayAngle * 180) / pi)} degrees (${
    //     Math.round(displayAngle * 100) / 100
    //     } radians)`,
    //     200,
    //     200
    // );

    ctx.fillText(`Game difficulty: ${gameDifficulty()}`, 200, 200);

    // ctx.fillText(`Raw angle: ${Math.round(angle * 100) / 100} radians (inverted Y axis)`, 20, 50);
    // ctx.fillText(`Inner joystick: (${positions.innerX},${positions.innerY})`, 200, 200);
    // ctx.fillText(`Touch start point: (${positions.fixedX},${positions.fixedY}) or (${Math.round(positions.fixedX/window.innerWidth*1000)/1000},${Math.round(positions.fixedY/window.innerHeight*1000)/1000})`, 200, 300);
    
    // Draw joystick outer circle
    ctx.beginPath();
    ctx.fillStyle = "#0004";
    ctx.arc(positions.fixedX, positions.fixedY, 50, 0, 2 * pi);
    ctx.fill();
    ctx.closePath();

    // Draw inner circle
    ctx.beginPath();
    ctx.fillStyle = "#0008";
    ctx.arc(positions.innerX, positions.innerY, 30, 0, 2 * pi);
    ctx.fill();
    ctx.closePath();
}







/*var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
window.addEventListener('keydown', preventDefaultForScrollKeys, false);*/