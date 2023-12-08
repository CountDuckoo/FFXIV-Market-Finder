$( function(){
    var regionEl = $('#region');
    var itemTypeEl = $('#itemtype');
    var characterIdEl = $('#characterID');
    var searchBtn = $('#search');
    var displayDiv = $('#results');

    var tradeableResults=[];

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
            if(characterId&&characterId>0){
                isCharacterSearch=true;
                searchURL+="characters/" + characterId + "/";
            //the character ID is not empty, but it can't become an int, or is less than or equal to 1
            } else{
               // display a warning and don't search
               console.log("warning bad ID");
               return;
            }
        // it is empty, so it is a regular search, not a character search
        } else {
            isCharacterSearch=false;
        }
        var region = regionEl.val();
        if (!region){
            // display a warning and don't search
            console.log("warning empty region");
            return;
        }
        var itemType = itemTypeEl.val();
        if (!itemType){
            // display a warning and don't search
            console.log("warning empty item type");
            return;
        }
        searchURL+=itemType;
        if(isCharacterSearch){
            //only searches for items the character does not have
            searchURL+="/missing";
        }
        //passes the URL and the region to the search function
        collectSearch(searchURL, region);
    });
    
    function collectSearch(searchURL, region){
        fetch(searchURL)
        .then(function(response){
            if(response.ok){
                return response.json();
            } else {
                // if it doesn't give a response, most commonly from the character ID not being public,
                //stop executing the rest of the code
                // TODO: display to the user what the problem is if this happens
                throw new Error(response.status);
            }
        })
        .then(function(data){
            var results=[];
            // if it is a character search, it returns the array directly instead of an object containing the array
            if(Array.isArray(data)){
                results = data;
            } else {
                results = data.results;
            }
            // store tradeableResults as a global variable, so we can use it to get the URLs for the images
            tradeableResults = results.filter((item) => item.tradeable);
            var tradeableItemList = [];
            // if there are more than 100 objects, trim it down to 100 for the second search, as it has a limit of 100
            for (let i=0; i<100&&i<tradeableResults.length; i++){
                tradeableItemList.push(tradeableResults[i].item_id);
            }
            //convert it to a string for use in the URL for the second fetch
            tradeableItemList=tradeableItemList.toString();
            var universalisURL="https://universalis.app/api/v2/"+region+"/"+tradeableItemList;
            console.log(universalisURL);
        })
        .catch(function(e){
            console.error(`${e.name}: ${e.message}`);
        });
    }
    // button listener to get the inputs
    // determine what fetch we need to make from those inputs
    // transfer that data to make a request to the other API
    // display the results on the page

});