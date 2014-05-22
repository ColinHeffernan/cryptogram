var dictionary = null;
var reverseDict = null;
var freeLetters = null;
var cryptedMessage = null;
var frequencyTable = null;

// function to be called when begin button is pressed
function initialize(){
    dictionary = new Array();
    reverseDict = new Array();
    frequencyTable = new Array();
    ALPHABET = new Array();
    addResetButton();
    var A = "A".charCodeAt(0);
    for (var i = 0; i < 26; i++){ // fill alphabet array
        var newChar = String.fromCharCode(A + i);
        ALPHABET.push(newChar);
    }
    freeLetters = ALPHABET.slice(0); // reset the freeLetters array to a copy of the ALPHABET array
    var messageInput = document.getElementById("messageInput"); 
    messageInput.setAttribute("onkeyup", "updateEssentials();"); // make the cryptedMessage update every time the user types in the box
    window.onresize = updateEssentials;
    updateEssentials(); // adds the letter selection, message display, and frequency tables
}



function updateEssentials(){
    frequencyTable = new Array(); // frequencyTable will be handled by the getMessageDisplay method
    cryptedMessage = getCryptedMessage(); // get the latest version of the input crypted message stored in an array of words
    var coreLogic = document.getElementById("coreLogic");
    coreLogic.innerHTML = "";
    coreLogic.appendChild(newFreeLetterDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newMessageDisplay());
    coreLogic.appendChild(newLine());
    coreLogic.appendChild(newFrequencyDisplay());
}

// returns the message as an array of word for displaying the message and controlling text wrapping
function getCryptedMessage(){
    var messageInput = document.getElementById("messageInput");
    var crypt = new Array(); // array of strings each representing a word
    var input = messageInput.value.toUpperCase().trim(); // ignore leading and trailing white space
    var i = 0; // index of the current character being investigated
    var currentWord = "";
    while (i < input.length){ // loop through every letter in the input
        var currentCharacter = input.charAt(i).toUpperCase(); // only deal with upper case letters
        appendFrequency(currentCharacter); // add the current Letter to the frequency table

        if (!(currentCharacter == ' ' || currentCharacter == '\n')){
            currentWord += currentCharacter; // add the current character to the current word
        }
        else{ // if we have a reached a space or end of the line
            if (!currentWord == ""){ // don't add empty words
                crypt.push(currentWord); 
            }
            currentWord = ""; // reset the currentWord (will not contain the current space)
        }
        if (i == input.length - 1){ // if we have reached the end of the file
            if (!currentWord == ""){ // don't add empty words
                crypt.push(currentWord);  // add the last word in
            }
            currentWord = ""; // reset the currentWord (will not contain the current space)
        }
        i++;
    }
    return crypt;
}

// returns a div element full of the draggable freeLetters
function newFreeLetterDisplay(){
    var freeLetterDisplay = document.createElement("div");
    freeLetterDisplay.setAttribute("id", "freeLetterDisplay");
    for(var i = 0; i < freeLetters.length; i++){
        freeLetterDisplay.appendChild(newDraggableFreeLetter(freeLetters[i]));
    }
    return freeLetterDisplay;
}

// returns the div element containing the entire display of original message beneath updated message containing substitutions
function newMessageDisplay(){
    var messageDisplay = document.createElement("div");
    messageDisplay.setAttribute("id", "messageDisplay");
    for (var i = 0; i < cryptedMessage.length; i++){
        var currentWord = cryptedMessage[i]; // current letter being examined
        messageDisplay.appendChild(newWordDisplay(currentWord));
        if (i < cryptedMessage.length - 1){ // add a space at the end of each word except for the last
            messageDisplay.appendChild(newSpace());
        }
    }
    return messageDisplay;
}

function newFrequencyDisplay(){
    var frequencyDisplay = document.createElement("div");
    frequencyDisplay.setAttribute("id", "frequencyDisplay");
    var index = 0;
    for (var letter in frequencyTable){
        index ++;
        frequencyDisplay.appendChild(newFrequency(letter, frequencyTable[letter]));
    }
    return frequencyDisplay;
}   

// helper methods for the three essential methods above

// returns a div element for the current word
function newWordDisplay(word){    
    var wordDisplay = document.createElement("div");
    wordDisplay.setAttribute("class", "wordDisplay");
    for (var i = 0; i < word.length; i++){ // index through the current word
        var currentLetter = word.charAt(i);
        if (isLetter(currentLetter)){ // if the current character is A-Z
            wordDisplay.appendChild(newEditableLetterDisplay(currentLetter)); // letterTable which can be modified for substitutions
        }
        else{ // if the current character is not A-Z
            wordDisplay.appendChild(newUneditableCharacterDisplay(currentLetter)); // letterTable which can not be modified
        }
    }
    return wordDisplay;
}

// returns a div element displaying the crypted letter from the original message and its editable substitute
function newEditableLetterDisplay(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    var top = document.createElement("div");
    top.setAttribute("ondragover", "allowDrop(event);"); // permit dragging and dropping from this element
    top.setAttribute("ondrop", "letterDraggedIntoMessage(event);"); // permit dragging and dropping with this letter
    top.setAttribute("ondragleave", "letterDraggedOutOfMessage(event);");
    top.setAttribute("class", "letterHolder");
    top.setAttribute("value", letter);
    top.appendChild(newEditableMessageLetter(letter));
    letterDisplay.appendChild(top);
    letterDisplay.appendChild(newLine());
    var bottom = document.createElement("div");
    bottom.setAttribute("class", "letterHolder");
    bottom.appendChild(cryptedCharacter(letter));
    letterDisplay.appendChild(bottom);
    return letterDisplay;
}

// returns a div element displaying the crypted letter from the original message and its editable substitute
function newUneditableCharacterDisplay(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    var top = document.createElement("div");
    top.setAttribute("class", "letterHolder");
    top.appendChild(newUneditableMessageCharacter(letter));
    letterDisplay.appendChild(top);
    letterDisplay.appendChild(newLine());
    var bottom = document.createElement("div");
    bottom.setAttribute("class", "letterHolder");
    bottom.appendChild(cryptedCharacter(letter));
    letterDisplay.appendChild(bottom);
    return letterDisplay;
}

// returns a div element for the uneditable non A-Z characters in a messageDisplay character table's top cell
function newUneditableMessageCharacter(character){ // div element to be in the top cell of each letter display
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("value", character);
    letterDisplay.textContent = character;
    return letterDisplay;
}

// returns a draggable and editable letter to be added for A-Z characters in the messageDisplay letter table's top cell
function newEditableMessageLetter(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("original", letter); // original attribute holds the letter in the original crypted message
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("draggable", true);
    letterDisplay.setAttribute("ondragstart", "letterDragged(event);");
    letterDisplay.setAttribute("onmouseenter", "highlightLetter(this);");
    if (letter in dictionary){
        letterDisplay.setAttribute("value", dictionary[letter]);
        letterDisplay.textContent = dictionary[letter];
    }
    else{
        letterDisplay.setAttribute("value", "");
        letterDisplay.textContent = "";
    }
    return letterDisplay;
}

// returns a div element for the characters in the original crypted message
function cryptedCharacter(character){
    var characterDisplay = document.createElement("div");
    characterDisplay.setAttribute("class", "cryptedCharacter");
    characterDisplay.setAttribute("value", character);
    characterDisplay.textContent = character;
    return characterDisplay;
}

//handle all the dragging events

function allowDrop(event){
    event.preventDefault();
}

// return a letter to the free letters table when it is dragged out of the message
function letterDraggedOutOfMessage(ev){
    event.preventDefault();
    var substitution = event.dataTransfer.getData("Text"); // value of the letter being dragged
    var original = reverseDict[substitution];
    if (freeLetters.indexOf(substitution) < 0 && isLetter(substitution)){ // only add the letter to the table if it is not already there
        freeLetters.push(substitution);
        freeLetters.sort();
    }
    delete dictionary[original];
    delete reverseDict[substitution];
    updateEssentials(); // rebuild the free letters tables
}

// substitute accordinly when a freeLetter is dragged into a letter slot in the message display
function letterDraggedIntoMessage(event){
    event.preventDefault();
    var substitution = event.dataTransfer.getData("Text"); // value of the letter being dragged
    var original = event.currentTarget.getAttribute("value"); // cell that the letter is being dragged towards
    substitute(original, substitution);
}

function letterDragged(event){ // tell the recipient of this letter what letter is coming
    event.dataTransfer.setData("Text", event.currentTarget.getAttribute("value")); // send the substitution value
}

// returns a draggable div element to be inserted into the freeLettersDisplay
function newDraggableFreeLetter(letter){
    var letterDisplay = document.createElement("div");
    letterDisplay.textContent = letter;
    letterDisplay.setAttribute("value", letter);
    letterDisplay.setAttribute("class", "decryptedCharacter");
    letterDisplay.setAttribute("draggable", true);
    letterDisplay.setAttribute("ondragstart", "letterDragged(event);");
    return letterDisplay;
}

// returns a div element to display a letter and its frequency in the original crypted message
function newFrequency(letter, frequency){
    var display = document.createElement("div");
    display.setAttribute("class", "letterFrequency");
    display.textContent = letter + " = " + frequency;
    return display;
}

function highlightLetter(element){
    var toHighlight = getElementByAttributeValue("original", element.getAttribute("original"));
    for (var i = 0; i < toHighlight.length; i++){
        currElement = toHighlight[i];
        currElement.setAttribute("class", "highlightedLetter");
        currElement.setAttribute("id", "highlighted"); // tell the program which letter is highlighted
        currElement.setAttribute("onmouseleave", "unhighlightLetter(this);");
    }
    document.onkeypress = keyPressedWhileHighlighted;
}

// unhighlight the letter when the mouse exits
function unhighlightLetter(element){
    document.onkeypress = null;
    var toUnHighlight = getElementByAttributeValue("original", element.getAttribute("original"));
    for (var i = 0; i < toUnHighlight.length; i++){
        currElement = toUnHighlight[i];
        currElement.setAttribute("class", "decryptedCharacter");
        currElement.removeAttribute("id"); // tell the program which letter is highlighted
    }
}

// function to be called when a key is pressed while a letter is highlighted
function keyPressedWhileHighlighted(evt) { 
  evt = evt || window.event; 
  var charCode = evt.charCode || evt.keyCode;
  var substitution = String.fromCharCode(charCode).toUpperCase(); 
  var lettersToChange = document.getElementsByClassName("highlightedLetter");
  var original = lettersToChange[0].getAttribute("original").toUpperCase(); // only need the original from one of the elements 
  substitute(original, substitution);
};

// carries out a suggested substitution
function substitute(original, substitution){
    var currentSub = dictionary[original];
    var currentOriginal = reverseDict[substitution];
    delete dictionary[currentOriginal]; // the substituted value now stands for something different if at all
    delete reverseDict[currentSub]; // always removing the current substitution no matter what
    if (currentSub != null && freeLetters.indexOf(currentSub) < 0){ // only return the letter to the free letters table if it is not  already there
        freeLetters.push(currentSub);
        freeLetters.sort();
    }
    if (isLetter(substitution)){
        deleteFreeLetter(substitution);
        dictionary[original] = substitution;
        reverseDict[substitution] = original;
    }
    else{ // if any other character is typed, delete the dictionary entry
        delete dictionary[original]; 
    }
    updateEssentials();
}

// resets all relevent data in the webpage
function reset(){
    freeLetters = ALPHABET.slice(0);
    dictionary = new Array();
    reverseDict = new Array();
    updateEssentials();
}

// handles a letter's frequency value in the frequency table
function appendFrequency(letter){
    if (isLetter(letter)){ // only worry about characters that are letters
        if (frequencyTable[letter] != null){
            frequencyTable[letter] ++;
        }
        else{
            frequencyTable[letter] = 1;
        }
    }
}

// deletes a letter from the freeLetters array when it is substituted
function deleteFreeLetter(letter){
    var subInd = freeLetters.indexOf(letter);
    if (subInd >= 0){ // only delete an element that exists
        freeLetters.splice(subInd, 1); // remove the element from the free letters array
    }
}

// adds the reset button to the buttons panel
function addResetButton(){
    var buttons = document.getElementById("buttons");
    if (buttons.getElementsByTagName("button").length <= 1){
        buttons.appendChild(resetButton());
    }
}

// returns a reset button to be appended to the buttons panel
function resetButton(){
    var button = document.createElement("button");
    button.setAttribute("value", "Reset");
    button.setAttribute("onclick", "reset();");
    button.textContent = "Reset";
    return button;
}

// returns an element with a br tag
function newLine(){
    return document.createElement("br");
}

// returns an empty div element to represent a space in the messageDisplay
function newSpace(){
    var letterDisplay = document.createElement("div");
    letterDisplay.setAttribute("class", "letter");
    return letterDisplay;
}

// returns a list of all
function getElementByAttributeValue(attribute, value)
{
  var allElements = document.getElementsByTagName('*');
  var matches = new Array();
  for (var i = 0; i < allElements.length; i++){
    if (allElements[i].getAttribute(attribute) == value)
    {
      matches.push(allElements[i]);
    }
  }
    return matches;
}

// determines whether or not a character is A-Z
function isLetter(letter){
    return (letter.charCodeAt(0) <= 90 && letter.charCodeAt(0) >= 65);
}