$( function(){
    var regionEl = $('#region');
    var itemTypeEl = $('#itemtype');
    var characterIdEl = $('#characterID');
    var searchBtn = $('#search');
    var displayDiv = $('#results');

    searchBtn.on( "click", function(event){
        event.preventDefault();
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
               console.log("warning bad ID");
            }
        // it is empty, so it is a regular search, not a character search
        } else {
            isCharacterSearch=false;
        }
        var region = regionEl.val();
        if (!region){
            // display a warning and don't search
            console.log("warning empty region");
        }
        var itemType = itemTypeEl.val();
        if (!itemType){
            // display a warning and don't search
            console.log("warning empty item type");
        }
        searchURL+=itemType;
        if(isCharacterSearch){
            searchURL+="/missing";
        }

        console.log(region);
        console.log(itemType);
        console.log(isCharacterSearch);
        console.log(searchURL);
    });
    
    // button listener to get the inputs
    // determine what fetch we need to make from those inputs
    // transfer that data to make a request to the other API
    // display the results on the page

});