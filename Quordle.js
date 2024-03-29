document.addEventListener('DOMContentLoaded', function () {
    InitialiseAll();
    document.addEventListener('keydown', KeyPressed);
});

score = 0;

function InitialiseAll(){
    InitialiseGrid();
    InitialiseGame();
    let keyboard = document.getElementById("KeyBoard");
    keyboard.remove();
    document.body.appendChild(keyboard);
    let letters = keyboard.getElementsByTagName("button");
    for (let i = 0; i<letters.length; i++){
        let letter = letters[i].innerText
        letters[i].setAttribute("id",letter);
        letters[i].setAttribute("onclick",`VirtualKeyBoardInput("${letter}")`);
    }
}

function InitialiseGrid(){
    if (document.getElementById("AllGames")){
        document.getElementById("AllGames").remove();
    }
    // Create the initial grids
    newDiv = document.createElement("div");
    newDiv.setAttribute("id", `AllGames`);
    newDiv.setAttribute("class", "AllGames");
    document.body.appendChild(newDiv);
    for (let i = 0; i < 4; i++) {
        newDiv = document.createElement("div");
        newDiv.setAttribute("id", `Game${i + 1}`);
        newDiv.setAttribute("class", "IndividualGame");
        document.getElementById("AllGames").appendChild(newDiv);
        for (let j = 0; j < 9; j++) {
            newRow = document.createElement("div");
            newRow.setAttribute("id", `Game${i + 1}Row${j + 1}`);
            newRow.setAttribute("class", "IndividualRow");
            document.getElementById(`Game${i + 1}`).appendChild(newRow);
            for (let k = 0; k < 5; k++) {
                newCell = document.createElement("p");
                newCell.setAttribute("id", `Game${i + 1}Row${j + 1}Cell${k + 1}`);
                newCell.setAttribute("class", "IndividualCell");
                document.getElementById(`Game${i + 1}Row${j + 1}`).appendChild(newCell);
            }
        }
    }
}

function InitialiseGame(){
    currentGuess = 1
    currentCell = 1
    playing = [true,true,true,true];

    // Pick 4 random words
    // Random Word Generator: https://random-word-api.vercel.app/
    words = $.ajax({
        url: "https://random-word-api.vercel.app/api?words=4&length=5&type=uppercase",
        type: "GET",
        success: function (data) {
            words = data;
        },
        async: false
    });
    // words = {}
    // words["responseJSON"] = ["BEECH","SIEGE","CHOSE","STONE"];
    console.log(words["responseJSON"]);
}

function KeyPressed(data) {
    if (data.code == "Backspace") {
        BackSpace();
        return;
    }

    else if (data.code == "Enter") {
        Submit();
        return;
    }

    if (data.key.length == 1) {
        let letter = data.key.toUpperCase();
        AddLetter(letter);
    }
}

function AddLetter(letter) {
    if (currentCell <= 5 && currentGuess <= 9) {
        for (let i = 1; i < 5; i++) {
            if (playing[i-1]){
                document.getElementById(`Game${i}Row${currentGuess}Cell${currentCell}`).innerText = letter;
            }
        }
        currentCell += 1;
    }
}

function BackSpace() {
    if (currentCell >= 2 && currentCell <= 6) {
        for (let i = 1; i < 5; i++) {
            document.getElementById(`Game${i}Row${currentGuess}Cell${currentCell - 1}`).innerText = "";
        }
        currentCell--;
    }
}

function Submit() {
    if (currentCell != 6) { // At the end of the guess the current cell will be 6
        return;
    }

    let guess = "";
    for (let i = 1; i <= 4; i++) {
        if (playing[i-1]){
            for (let j = 1; j <= 5; j++) {
                cellID = `Game${i}Row${currentGuess}Cell${j}`;
                cell = document.getElementById(cellID);
                letter = cell.innerText;
                guess += letter;
            }
            break;
        }
    }
    console.log(guess);

    CheckValidGuess(guess);
    if (!isValid){
        ShowInvalidGuess();
        //alert("Invalid Guess");
        return;
    }
    CheckLetters();
    CheckWord();
    UpdateScore();
    currentGuess++;
    currentCell = 1;

    if (!playing.includes(true)){
        WonGame();
    }
    else if (currentGuess > 9) {
        alert(`You have run out of guesses \nThe words were ${words["responseJSON"]}`);
        score = 0;
    }
}

function CheckLetters() {
    for (let i = 1; i <= 4; i++) {
        if (playing[i-1]){
            let gameWord = words["responseJSON"][i - 1]
            let information = [];
            let tempGameWord = "";
            let tempGuess = "";
            let indicies = [];
            for (let j = 1; j <= 5; j++) {
                cellID = `Game${i}Row${currentGuess}Cell${j}`;
                cell = document.getElementById(cellID);
                letter = cell.innerText;
                if (letter == gameWord[j - 1]) {
                    information[j - 1] = ["G", i, j];
                }
                else {
                    tempGuess += letter;
                    tempGameWord += gameWord[j - 1];
                    indicies.push(j-1)
                }
            }

            for (let j = 1; j <= tempGuess.length; j++) {
                if (tempGameWord.indexOf(tempGuess[j - 1]) >= 0) {
                    information[indicies[j - 1]] = ["O", i, indicies[j - 1]+1]
                    tempGameWord = tempGameWord.replace("tempGuess[j - 1]","_");
                }
                else {
                    information[indicies[j - 1]] = ["I", i, indicies[j - 1]+1]
                }
            }

            for (let j = 1; j <= 5; j++) {
                if (information[j - 1][0] == "G") {
                    MakeCellGreen(information[j - 1][1], information[j - 1][2]);
                }
                else if (information[j - 1][0] == "O") {
                    MakeCellOrange(information[j - 1][1], information[j - 1][2]);
                }
                else {
                    MakeCellGray(information[j - 1][1], information[j - 1][2]);
                }
            }
        }
    }
}

function MakeCellGreen(i, j) {
    document.getElementById(`Game${i}Row${currentGuess}Cell${j}`).setAttribute("class", "IndividualCell Letter_In_Place");
}

function MakeCellOrange(i, j) {
    document.getElementById(`Game${i}Row${currentGuess}Cell${j}`).setAttribute("class", "IndividualCell Letter_In_Word");
}

function MakeCellGray(i, j) {
    document.getElementById(`Game${i}Row${currentGuess}Cell${j}`).setAttribute("class", "IndividualCell Letter_Not_In_Word");
}

function CheckWord(){
    for (let i = 1; i <= 4; i++) {
        let gameWord = words["responseJSON"][i - 1]
        let guess = ""
        for (let j = 1; j<=5; j++){
            guess += document.getElementById(`Game${i}Row${currentGuess}Cell${j}`).innerText;
        }

        if (gameWord == guess){
            playing[i-1] = false;
            score += 1;
        }
    }
}

function WonGame(){
    alert("You have won the game!");
}

function CheckValidGuess(guess){
    $.ajax({
        url: `https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`,
        type: "GET",
        success: function (data) {
            console.log(data);
            console.log(data[0]["word"]);
            isValid = true;
        },
        error: function (data) {
            isValid = false;
        },
        async: false
    });
}

function Sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ShowInvalidGuess(){
    ChangeCellColor("red");
    await Sleep(500);
    RemoveCellColor("transparent");
}

function ChangeCellColor (color){
    for (let i = 1; i <= 4; i++) {
        if (playing[i-1]){
            for (let j = 1; j <= 5; j++) {
                cellID = `Game${i}Row${currentGuess}Cell${j}`;
                cell = document.getElementById(cellID);
                cell.style.backgroundColor = color;
            }
        }
    }
}

function RemoveCellColor(){
    for (let i = 1; i <= 4; i++) {
        if (playing[i-1]){
            for (let j = 1; j <= 5; j++) {
                cellID = `Game${i}Row${currentGuess}Cell${j}`;
                cell = document.getElementById(cellID);
                
                cell.removeAttribute("style");
            }
        }
    }
    
}

function UpdateScore(){
    document.getElementById("CurrentScore").innerText = "Current Score: " + score;
}

function VirtualKeyBoardInput(letter){
    if (letter == "BackSpace"){
        BackSpace();
    }
    else if (letter == "Enter"){
        Submit();
    }
    else{
    AddLetter(letter);
    }
}