var regionEl = $('#region');
var itemTypeEl = $('#itemType');
var characterIdEl = $('#characterID');
var displayDiv = $('#display');

var searchURL = "https://ffxivcollect.com/api/";
var isCharacterSearch=false;
var characterId= characterIdEl.val().trim();
// if it is not empty
if(characterId){
    // convert it to an int, or NaN if not possible to
    characterId=parseInt(characterId);
    // if it is not NaN, and it is greater than 0, this is a character search,
    // and add the text and the id to the search URL
    if(characterId&&characterId>1){
        isCharacterSearch=true;
        searchURL+="characters/" + characterId + "/";
    //the character ID is not empty, but it can't become an int, or is less than or equal to 1
    } else{
        // display a warning and don't search
    }
// it is empty, so it is a regular search, not a character search
} else {
    isCharacterSearch=false;
}

//need to make sure it is a positive integer greater than 1, if no, display a warning and don't search
var region = regionEl.val();
console.log(region);
// button listener to get the inputs
// determine what fetch we need to make from those inputs
// transfer that data to make a request to the other API
// display the results on the page