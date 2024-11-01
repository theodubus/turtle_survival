let timeNextCheck = 0;
let checkInterval = 3000;
let checkTolerance = 2000;

export function checkCheat(){
    if (Date.now() < timeNextCheck){
        return 0;
    }
    
    let timeSinceLastCheck = Date.now() - timeNextCheck;

    // No check for a certain time, the game has been paused
    if (timeSinceLastCheck > checkInterval + checkTolerance){
        return 1;
    }

    timeNextCheck = Date.now() + checkInterval;
    return 2;
}