$( function(){
    var regionEl = $('#region');
    var itemTypeEl = $('#itemtype');
    var characterIdEl = $('#characterID');
    var searchBtn = $('#search');
    var displayDiv = $('#results');
    // creates an empty array that is going to hold all the items to display
    var itemsToDisplay = [];

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
            //TODO: display message on the page
            console.log("warning empty region");
            return;
        }
        var itemType = itemTypeEl.val();
        if (!itemType){
            // display a warning and don't search
            //TODO: display message on the page
            console.log("warning empty item type");
            return;
        }
        searchURL+=itemType;
        if(isCharacterSearch){
            //only searches for items the character does not have
            searchURL+="/missing";
        }
        //passes the URL and the region to the search function
        collectSearch(searchURL, region, itemType);
    });
    
    function collectSearch(searchURL, region, itemType){
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
            universalisSearch(universalisURL, itemType);
        })
        .catch(function(e){
            console.error(`${e.name}: ${e.message}`);
        });
    }

    function universalisSearch(searchURL, itemType){
        fetch(searchURL)
        .then(function(response){
            if(response.ok){
                return response.json();
            } else {
                // if it doesn't give a response stop executing the rest of the code
                // TODO: display to the user what the problem is if this happens
                throw new Error(response.status);
            }
        })
        .then(function(data){
            var responses=Object.values(data.items);
            // clears the items to display to prepare to add new ones
            itemsToDisplay=[];
            // loops through the responses
            for(let j=0; j<responses.length; j++){
                // the responses are sorted by price per unit, so get the first one that is just 
                //an individual item as you do not need more than one
                let cheapestIndividual=responses[j].listings.find((item) => item.quantity==1);
                let itemID=responses[j].itemID;
                // get the item from the call to FFXIV Collect that has the same item ID
                let collectItem=tradeableResults.find((item) => item.item_id==itemID);
                let itemUrl='';
                // orchestrions do not have an image, so use the icon instead
                if(itemType=="orchestrions"){
                    itemUrl=collectItem.icon;
                } else{
                    itemUrl=collectItem.image;
                }
                // create an item that has the name, ID, a picture, the price, and what server it is on
                const item={
                    name:collectItem.name,
                    itemId:itemID,
                    itemImg:itemUrl,
                    price:cheapestIndividual.pricePerUnit,
                    location:cheapestIndividual.worldName,
                };
                // add that item to the list
                itemsToDisplay.push(item);
            }
            console.log(itemsToDisplay);
            //display the new items
            displayItems();
        })
        .catch(function(e){
            console.error(`${e.name}: ${e.message}`);
        });
    }

    function displayItems(){

    }
});