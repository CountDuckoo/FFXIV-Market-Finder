$( function(){
    var regionEl = $('#region');
    var itemTypeEl = $('#itemtype');
    var characterIdEl = $('#characterID');
    var searchBtn = $('#search');
    var displayDiv = $('#results');
    var response=$('#user-response');
    var backGround=$('.backgroundImage');
    // creates an empty array that is going to hold all the items to display
    var itemsToDisplay = [];
    var isCharacterSearch = false;
    var characterId='';

    var tradeableResults=[];

    //if there is a search in storage, get and display those results
    var storedItems = JSON.parse(sessionStorage.getItem("itemList"));
    if(storedItems){
        itemsToDisplay=storedItems;
        regionEl.val(sessionStorage.getItem("region"));
        itemTypeEl.val(sessionStorage.getItem("itemType"));
        //if there was a character ID saved, get it
        let tempCharId=sessionStorage.getItem("characterId");
        if(tempCharId){
            characterIdEl.val(tempCharId);
            isCharacterSearch = true;
        }
        displayItems();
    }

    searchBtn.on( "click", function(event){
        event.preventDefault();
        var searchURL = "https://ffxivcollect.com/api/";
        isCharacterSearch=false;
        characterId= characterIdEl.val().trim();
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
               response.text("Not A Possible Character Id.");
               return;
            }
        // it is empty, so it is a regular search, not a character search
        } else {
            isCharacterSearch=false;
        }
        var region = regionEl.val();
        if (!region){
            // display a warning and don't search
            response.text("No Region Selected.");
            return;
        }
        var itemType = itemTypeEl.val();
        if (!itemType){
            // display a warning and don't search
            response.text("No Item Selected.");
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
            response.text("Searching.");
            universalisSearch(universalisURL, region, itemType);
        })
        .catch(function(e){
            console.error(`${e.name}: ${e.message}`);
            if(e.message=="404"){
                response.text("Charcter Id Does Not Exist Or Is Not Public.");

            }else{
                response.text(`${e.name}: ${e.message}`);
            }
        });
    }

    function universalisSearch(searchURL, region, itemType){
        fetch(searchURL)
        .then(function(response){
            if(response.ok){
                return response.json();
            } else {
                // if it doesn't give a response stop executing the rest of the code
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
            // at this point it is a successful search, so update the storage with the results
            //and search parameters
            sessionStorage.setItem("itemList", JSON.stringify(itemsToDisplay));
            sessionStorage.setItem("region", region);
            sessionStorage.setItem("itemType", itemType);
            if(isCharacterSearch){
                sessionStorage.setItem("characterId", characterId);
            } else {
                sessionStorage.removeItem("characterId");
            }
            //display the new items
            displayItems();
        })
        .catch(function(e){
            console.error(`${e.name}: ${e.message}`);
            response.text(`${e.name}: ${e.message}`+" Server Error");
        });
    }

    function displayItems(){
        // clear the current display
        displayDiv.empty();
        displayDiv.addClass("has-background-info");
        backGround.attr("hidden","true");
        response.text("");
        // get the screen width for responsive design
        let screenWidth = window.innerWidth;
        // how many items by row
        let sizeFactor=6;
        let tileSize="is-2";
        // if it is smaller, display fewer items per row
        if(screenWidth<1200){
            sizeFactor=4;
            tileSize="is-3";
        }
        if(screenWidth<769){
            sizeFactor=1;
            // if the screen is narrow enough, bulma will ignore tileSize so don't need to set it
        }
        // create a number of row divs based on the number of results and the items per row
        for(let j=0; (j*sizeFactor)<itemsToDisplay.length; j++){
            var row = $('<div>').addClass("tile is-parent").attr("id", ("row-" + j));
            displayDiv.append(row);
        }
        for(let i=0; i<itemsToDisplay.length; i++){
            // get the current row to add it to based on the current item number and the items per row
            var currentRowId = "#row-" + Math.floor(i/sizeFactor);
            var currentRow = displayDiv.children(currentRowId);
            // get the current item to simplify calls
            var item=itemsToDisplay[i];
            // create the card
            var cardHolder=$('<div>').addClass("tile is-child "+tileSize).attr("id", ("result-" + i));
            var itemCard= $('<div>').addClass("card m-1");

            // create the header, and add the name
            var itemHeader= $('<header>').addClass("card-header");
            var itemTitle = $('<p>').addClass("card-header-title").text(item.name);
            itemHeader.append(itemTitle);

            // create the image and make sure it is centered within the card
            var itemImgDiv = $('<div>').addClass("card-image has-text-centered");
            var itemFigure = $('<figure>').addClass("image is-128x128 is-inline-block");
            var itemImage = $('<img>').attr("src", item.itemImg).attr("alt", item.name);
            itemFigure.append(itemImage);
            itemImgDiv.append(itemFigure);

            // create the text on the card
            var contentDiv = $('<div>').addClass("card-content");
            var priceLine = $('<p>').addClass("is-size-5").text('Current Lowest Cost:');
            var priceLine2 = $('<p>').text(item.price + ' gil');
            var locationLine = $('<p>').addClass("is-size-5").text('Server to buy on:');
            var locationLine2 = $('<p>').text(item.location);
            contentDiv.append(priceLine, priceLine2, locationLine, locationLine2);

            // add all of the elements to the card, and put it in the current row
            itemCard.append(itemHeader, itemImgDiv, contentDiv);
            cardHolder.append(itemCard);
            currentRow.append(cardHolder);
        }
    }
});
