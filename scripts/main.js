var database = firebase.database();
var currentUserId = "";
var indexPath = "/C:/Users/Shivin/Downloads/template2/index.html";
/*var eventRef = database.ref('Event');
var inventoryRef = database.ref('Inventory');
var usersRef = database.ref('Users');*/

window.onload = init();

function init() {

    var loginFormDiv = document.getElementById('loginFormDiv');
    var tabsBar = document.getElementById('tabsBar');
    var currentUserRef = firebase.auth().currentUser;

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is already signed in
            loginFormDiv.style.display = "none";    // Hides the login form
            tabsBar.style.display = "block";        // Displays the tabs bar
            homeButtonClick();                      // Redirects to home page
        } else {
            // No user is signed in
            // logging in
            var loginButton = document.getElementById('loginButton');
            var loginPassword = document.getElementById('loginPassword');
            loginButton.onclick = loginButtonClick;
            loginPassword.onkeypress = function(eventObj) {
              // redirect to loginButtonClick if someone presses Enter key after entering ID and password
              enterKeyPress(eventObj, loginButtonClick);
            };

            function loginButtonClick() {

                var loginEmailValue = document.getElementById('loginEmail').value;
                var loginPasswordValue = document.getElementById('loginPassword').value;
                var loginText = document.getElementById('loginText');

                loginEmailValue += "@goa.bits-pilani.ac.in";

                firebase.auth().signInWithEmailAndPassword(loginEmailValue, loginPasswordValue).then(function(snapshot) {
                        // Log In successful
                        tabsBar.style.display = "block";
                        loginFormDiv.style.display = "none";
                        homeButtonClick();

                    },
                    function(error) {
                      // Log in unsuccessful, display error message below password field for 5 seconds
                        var errorMessage = error.message;
                        loginText.innerHTML = errorMessage;
                        setTimeout(function() {
                            loginText.innerHTML = "";
                        }, 5000);
                    });
            }
        }
    });

    // setting button click listeners for different tab pages
    var itemsButton = document.getElementById('itemsButton');
    itemsButton.onclick = itemsButtonClick;
    var eventsButton = document.getElementById('eventsButton');
    eventsButton.onclick = eventsButtonClick;
    var inventoryButton = document.getElementById('inventoryButton');
    inventoryButton.onclick = inventoryButtonClick;
    var membersButton = document.getElementById('membersButton');
    membersButton.onclick = membersButtonClick;
    var homeButton = document.getElementById('homeButton');
    homeButton.onclick = homeButtonClick;
    var logOutButton = document.getElementById('logOutButton');
    logOutButton.onclick = logOutButtonClick;
    var referencesButton = document.getElementById('referencesButton');
    referencesButton.onclick = referencesButtonClick;

}

function toDate(date) {
  // converts date from datetime-local format of HTML to 'dd-mmm-yyyy hh:mm:00 PM/AM'
    var pos = date.indexOf('T');
    var finalDate = date.substring(0, pos) + " " + date.substring(pos + 1, date.length) + ":00";
    return (finalDate);
}

function enterKeyPress(eventObj, buttonFunction) {
  // checks if pressed key is 'Enter' key (used in login form)
    if (eventObj.keyCode == 13)
        buttonFunction();
}

function displayModal(displayModalMessage, validateDisplayModalText, callbackFunc) {
  // generic function for displaying a modal that requires confirmation (Eg deleting event/item history)
    var displayModal = document.getElementById('displayModal');
    var displayModalText = document.getElementById('displayModalText');
    // validation button (Eg 'Yep' button in delete event/item history)
    var validateDisplayModalButton = document.getElementById('validateDisplayModalButton');

    displayModalText.innerHTML = displayModalMessage;
    validateDisplayModalButton.innerHTML = validateDisplayModalText;

    var displayModalClose = document.getElementById('displayModalClose');

    displayModal.style.display = "block";

    // When the user clicks on the validation button, execute the callbackFunc(true)
    validateDisplayModalButton.onclick = function() {
        displayModal.style.display = "none";
        callbackFunc(true);
    }

    // When the user clicks on <span> (x), execute the callbackFunc(false)
    displayModalClose.onclick = function() {
            displayModal.style.display = "none";
            callbackFunc(false);
        }
    // When the user clicks anywhere outside of the modal, execute the callbackFunc(false)
    window.onclick = function(event) {
        if (event.target == displayModal) {
            displayModal.style.display = "none";
            callbackFunc(false);
        }
    }

}


function tabButtonClick(currTab) {
  // executed when any of the tabs is clicked
    var tabs = ["homeDiv", "eventDiv", "membersDiv", "inventoryDiv", "itemsDiv", "referencesDiv"];
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i] == currTab) {
          // display the tab page of clicked tab button
            var currentTab = document.getElementById(currTab);
            currentTab.style.display = "block";
        } else {
          // hide tab pages of all other tabs
            var otherTab = document.getElementById(tabs[i]);
            otherTab.style.display = "none";

            /* to revert any changes done on the tab page [not sure]
            Eg - If you open the inventory tab for the first time, only 'Show All Items' and 'Show By Events' buttons are displayed.
            If you select 'test1' event via the 'Show By Events' option of Inventory tab, it'll show issue history of 'test1'.
            Now if you select some other tab and hide the inventory tab page simply, next time when you select inventory tab it will open up
            with the issue history of 'test1' (exactly as you left it last). To prevent this, you clone the tab page (clone consists of only
            the initial defined HTML code) and replace it with the current tab page so that everytime when you select inventory tab the page
            displays the initial screen consisting only of 'Show All Items' and 'Show By Events' buttons
            */
            var tabClone = otherTab.cloneNode(true);
            otherTab.parentNode.replaceChild(tabClone, otherTab);
        }
    }
    // stop the loading animation once the page has loaded
    var loader = document.getElementById('loader');
    loader.style.display = "none";
}

function logOutButtonClick() {
    firebase.auth().signOut().then(function() {
      // reload the page so it goes to login page
        location.reload();
    }, function(error) {
        console.log(error.message);
    });
}


function homeButtonClick() {

    // display 'Home' tab page and hide all other tab pages
    tabButtonClick("homeDiv");

    // start the loading animation
    var loader = document.getElementById('loader');
    loader.style.display = "block";

    firebase.auth().currentUser.providerData.forEach(function(profile) {
        currentUserId = profile.email.substring(0, 9);
    });

    //setting user profile
    var homeProfile = document.getElementById('homeProfile');
    var homeBlockHeading = document.getElementById('homeBlockHeading');
    var homeBlockContent = document.getElementById('homeBlockContent');
    database.ref('Users').once('value', function(snapshot) {

        var currentUser = snapshot.val()[currentUserId];
        var currentUserPosition;
        switch (currentUser.role) {
            case 0:
                currentUserPosition = "AVU Unit/Faculty";
                break;
            case 1:
                currentUserPosition = "Co-ordinator";
                break;
            case 2:
                currentUserPosition = "Core Member";
                break;
            case 3:
                currentUserPosition = "Crew Member";
                break;
            default:
                currentUserPosition = "";
        }
        var str = currentUserPosition + "<br>" + currentUserId;
        homeBlockHeading.innerHTML = currentUser.name;
        homeBlockContent.innerHTML = str;
        homeProfile.style.display = "block";
        // stop the loading animation
        loader.style.display = "none";
    });

    var changePasswordModal = document.getElementById('changePasswordModal');
    var changePasswordModalContent = changePasswordModal.innerHTML;

    var changePasswordButton = document.getElementById('changePasswordButton');
    changePasswordButton.onclick = function() {

        var currentUser = firebase.auth().currentUser;

        var changePasswordModalClose = document.getElementById('changePasswordModalClose');
        // Open the modal since the user has clicked on the 'Change Password' button
        changePasswordModal.style.display = "block";

        var validateChangePasswordButton = document.getElementById('validateChangePasswordButton');
        validateChangePasswordButton.onclick = function(eventObj) {

            var changePasswordText = document.getElementById('changePasswordText');
            var newPassword = document.getElementById('newPassword');
            var newPasswordFieldText = document.getElementById('newPasswordFieldText');

            currentUser.updatePassword(newPassword.value).then(function() {
              // password change successful
                changePasswordModal.style.display = "none";
                // reverting the dynamic changes to changePasswordModal and setting it to initial HTML
                changePasswordModal.innerHTML = changePasswordModalContent;
                // calling displayModal but without any validation action
                displayModal("Update Successful", "OK", function callbackFunc(val) {});
            }, function(error) {
                changePasswordModal.style.display = "none";
                changePasswordModal.innerHTML = changePasswordModalContent;
                // calling displayModal but without any validation action
                displayModal("Couldn't Update! Login Again", "OK", function callbackFunc(val) {});
            });
        }

        // When the user clicks on <span> (x), close the modal
        changePasswordModalClose.onclick = function() {
                changePasswordModal.style.display = "none";
                changePasswordModal.innerHTML = changePasswordModalContent;
            }
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == changePasswordModal) {
                changePasswordModal.style.display = "none";
                changePasswordModal.innerHTML = changePasswordModalContent;
            }
        }

    }

}

function eventsButtonClick() {

    // display 'Events' tab page and hide all other tab pages
    tabButtonClick("eventDiv");
    // start the loading animation
    var loader = document.getElementById('loader');
    loader.style.display = "block";

    var addEventModal = document.getElementById('addEventModal');
    var addEventButton = document.getElementById("addEventButton");
    var addEventModalClose = document.getElementById("addEventModalClose");

    addEventButton.onclick = function() {
            database.ref('Users/' + currentUserId).once('value', function(snapshot) {
              // Need snapshot value of 'Users' child if event addition can be only done by Coordies, else not needed
                var currentUserRole = snapshot.val().role;
                // display the 'Add Event' modal
                addEventModal.style.display = "block";
                var validateEventButton = document.getElementById('validateEventButton');
                validateEventButton.onclick = function() {
                        var eventExitTime = toDate(document.getElementById('eventExitTime').value);
                        var eventEntryTime = toDate(document.getElementById('eventEntryTime').value);
                        // create JSON object to be pushed to firebase database
                        var eventEntry = {
                            end: eventExitTime,
                            name: document.getElementById('eventName').value,
                            place: document.getElementById('eventVenue').value,
                            start: eventEntryTime
                        };
                        // push to 'Events' child in firebase database
                        database.ref('Event').push(eventEntry);
                        // close the modal
                        addEventModal.style.display = "none";
                    }
                    // if non-coordinator tries to add event
                    /* else {
                        var addEventButtonText = document.getElementById('addEventButtonText');
                        addEventButtonText.innerHTML = "You are not a Co-ordinator";
                        setTimeout(function() {
                            addEventButtonText.innerHTML = "";
                        }, 2000);
                    } */
            });
        }
    // When the user clicks on <span> (x), close the modal
    addEventModalClose.onclick = function() {
            addEventModal.style.display = "none";
        }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == addEventModal) {
            addEventModal.style.display = "none";
        }
    }


    database.ref('Event').on('value', function(snapshot) {
      // to update 'Events List' whenever change in Events child
        var eventList = document.getElementById("eventListTable");
        var data = snapshot.val();
        var str = '';
        for (var key in data) {
          // iterating over all event keys in 'Events' child
            if (data.hasOwnProperty(key)) {
                // button to delete event [shown as (x) at the end of each row]
                var buttonId = key + 'button';
                // converting firebase data to html
                str = "<tr> <td>" + data[key].name + "</td><td>" + data[key].place + "</td><td>" + data[key].start + "</td><td>" + data[key].end + '</td><td><button class="buttonA" id="' + buttonId + '">X</button></td></tr>' + str;
            }
        }
        str = '<thead><th colspan="4">EVENTS LIST</th></thead><th>Event Name</th> <th> Venue </th> <th> Entry Time </th> <th>Exit Time</th>' + str;

        // stop the loader animation
        loader.style.display = "none";
        eventList.innerHTML = str;
        //setting listeners for delete event button
        for (var key in data) {
            var buttonId = key + 'button';
            var button = document.getElementById(buttonId);
            button.onclick = deleteEventClick;
        }
    });

    function deleteEventClick(event) {
      // deletes event and history of all its items completely
        database.ref('Users/' + currentUserId).once('value', function(snapshot) {
            var currentUserRole = snapshot.val().role;
            // event deletion rights only with coordinator
            if (currentUserRole == 1) {
                displayModal("You sure? All items corresponding to this event will also be deleted", "Yep", function callbackFunc(val) {
                    if (val) {
                      // validation button clicked
                        var button = event.target;
                        var eventKey = button.id.substring(0, button.id.length - 6);
                        database.ref('Event/' + eventKey + '/items').once('value', function(snapshot) {
                            var itemsList = snapshot.val();
                            for (var key in itemsList) {
                              // iterating over all items issued to that event
                                var itemId = itemsList[key].item;
                                // removing item's history of the event
                                database.ref('Items/' + itemId + '/history/' + key).remove();
                                // removing inventory issued history
                                database.ref('Inventory/' + key).remove();
                            }
                        });
                        // removing event child
                        database.ref('Event/' + eventKey).remove();
                    }
                });
            } else {
              // if non-coordinator tries to delete event
                var addEventButtonText = document.getElementById('addEventButtonText');
                addEventButtonText.innerHTML = "You are not a Co-ordinator";
                setTimeout(function() {
                    addEventButtonText.innerHTML = "";
                }, 2000);
            }
        });
    }

}

function inventoryButtonClick() {

    tabButtonClick('inventoryDiv');

    var loader = document.getElementById('loader');
    loader.style.display = "block";

    database.ref('Items').once('value', function(snapshot) {
        var itemsList = snapshot.val();

        database.ref('Users').once('value', function(snapshot) {
            var usersList = snapshot.val();

            database.ref('Event').once("value").then(function(snapshot) {
                var eventList = snapshot.val();

                //issue item modal comes here
                var issueItemModal = document.getElementById('issueItemModal');

                var issueItemModalContent = issueItemModal.innerHTML;
                var issueItemButton = document.getElementById("issueItemButton");
                // Get the <span> element that closes the modal

                issueItemButton.onclick = function() {

                    var issueItemModalClose = document.getElementById('issueItemModalClose');
                    // When the user clicks on the button, open the modal
                    var eventSelect = document.getElementById('eventSelect');

                    var str = '';
                    for (var key in eventList) {
                        str = '<option id="' + key + 'option">' + eventList[key].name + '</option>' + str;
                    }
                    eventSelect.innerHTML = str;

                    var issuedToSelect = document.getElementById('issuedToSelect');
                    var issuedToSelectList = document.getElementById('issuedToSelectList');
                    str = '';

                    for (var key in usersList) {
                        str += '<option value="' + usersList[key].name + '">';
                    }
                    issuedToSelectList.innerHTML = str;

                    issueItemModal.style.display = "block";
                    var issueItemModalContentBefore = document.getElementById('issueItemModalContentBefore');

                    var issueMoreItemsButton = document.getElementById('issueMoreItemsButton');
                    issueMoreItemsButton.onclick = function() {
                        var newInputField = document.createElement('div');
                        newInputField.innerHTML = '<p style="display:inline-block"></p><input class="issueItemId"></input>';
                        issueItemModalContentBefore.appendChild(newInputField);
                    }

                    var validateIssueItemButton = document.getElementById('validateIssueItemButton');
                    validateIssueItemButton.onclick = function(eventObj) {

                        var currentdate = new Date();
                        var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getDate() + " " +
                            currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
                        var selOptionId = eventSelect.options[eventSelect.selectedIndex].id; //for events
                        var eventKey = selOptionId.substring(0, selOptionId.length - 6);

                        var issuedToKey = "";

                        for (var key in usersList) {
                            if (usersList[key].name == issuedToSelect.value) {
                                issuedToKey = key;
                                break;
                            }
                        }

                        var issueItemId = document.getElementsByClassName('issueItemId');

                        var str = {};
                        var str2 = '';
                        var strct = 0;

                        if (issuedToKey != "") {

                            database.ref('Inventory').once("value", function(snapshot) {
                                var inventoryList = snapshot.val();

                                for (var i = 0; i < issueItemId.length; i++) {

                                    var itemId = issueItemId[i].value;
                                    var lastKey;
                                    var itemDetails;
                                    var itemHistoryKeys;

                                    if (itemsList.hasOwnProperty(itemId)) {

                                        if (itemsList[itemId].history != null) {
                                            itemHistoryKeys = Object.keys(itemsList[itemId].history);
                                            lastKey = itemHistoryKeys[itemHistoryKeys.length - 1];
                                            itemDetails = inventoryList[lastKey];
                                        } else {
                                            itemDetails = null;
                                        }

                                        if ((itemDetails != null) && (itemDetails.status == "0")) {
                                            str2 += itemId + ',';
                                        } else {
                                            issueItem(itemId, true);
                                        }

                                    } else {
                                        str[strct++] = itemId;
                                    }
                                }

                                function issueItem(itemId, val) {
                                    var itemEntry = {
                                        item: itemId
                                    };
                                    var newKey = database.ref('Inventory').push().key;
                                    database.ref('Event/' + eventKey + '/items/' + newKey).set(itemEntry);
                                    if (val) {
                                        itemEntry = {
                                            event: eventKey
                                        };
                                        database.ref('Items/' + itemId + '/history/' + newKey).set(itemEntry);
                                    }
                                    itemEntry = {
                                        event: eventKey,
                                        id: issuedToKey,
                                        status: "0",
                                        time: datetime,
                                        item: itemId
                                    };
                                    database.ref('Inventory/' + newKey).set(itemEntry);
                                }

                                issueItemModal.style.display = "none";
                                issueItemModal.innerHTML = issueItemModalContent;

                                for (var key in str) {
                                    displayModal(str[key] + " is not registered in database. Do you still want to issue?", "Yes", function callbackFunc(val) {
                                        if (val)
                                            issueItem(str[key], false);
                                    });
                                }
                                if (str2 != '') {
                                    displayModal(str2.substring(0, str2.length - 1) + " : Item(s) already issued", "OK", function callbackFunc(val) {});
                                }
                            });
                        } else {
                            issueItemModal.style.display = "none";
                            issueItemModal.innerHTML = issueItemModalContent;
                            displayModal("Enter valid name to which item(s) are issued.", "OK", function callbackFunc(val) {});
                        }

                    }

                    // When the user clicks on <span> (x), close the modal
                    issueItemModalClose.onclick = function() {
                            issueItemModal.style.display = "none";
                            issueItemModal.innerHTML = issueItemModalContent;
                        }
                        // When the user clicks anywhere outside of the modal, close it
                    window.onclick = function(event) {
                        if (event.target == issueItemModal) {
                            issueItemModal.style.display = "none";
                            issueItemModal.innerHTML = issueItemModalContent;
                        }
                    }

                }

                //return item modal comes here
                var returnItemModal = document.getElementById('returnItemModal');
                var returnItemModalContent = returnItemModal.innerHTML;
                var returnItemButton = document.getElementById("returnItemButton");

                // When the user clicks on the button, open the modal
                returnItemButton.onclick = function() {

                    // Get the <span> element that closes the modal
                    var returnItemModalClose = document.getElementById('returnItemModalClose')

                    returnItemModal.style.display = "block";

                    var returnItemModalContentBefore = document.getElementById('returnItemModalContentBefore');

                    var returnMoreItemsButton = document.getElementById('returnMoreItemsButton');
                    returnMoreItemsButton.onclick = function() {
                        var newInputField = document.createElement('div');
                        newInputField.innerHTML = '<p style="display:inline-block"></p><input type="number" class="returnItemId"></input>';
                        returnItemModalContentBefore.appendChild(newInputField);
                    }

                    var validateReturnItemButton = document.getElementById('validateReturnItemButton');
                    validateReturnItemButton.onclick = function(eventObj) {

                            var returnItemId = document.getElementsByClassName('returnItemId');

                            var str = '';
                            var str2 = '';

                            for (var i = 0; i < returnItemId.length; i++) {

                                var itemId = returnItemId[i].value;

                                if (itemsList.hasOwnProperty(itemId)) {
                                    returnItem(itemId, returnItemId[returnItemId.length - 1].value);
                                } else {
                                    str += itemId + ',';
                                }

                                function returnItem(itemId, finalItemId) {

                                    database.ref('Items/' + itemId + '/history').limitToLast(1).once('value', function(snapshot) {

                                        var lastKey;
                                        for (var key in snapshot.val())
                                            lastKey = key;

                                        database.ref('Inventory/' + lastKey).once('value', function(snapshot) {

                                            var itemDetails = snapshot.val();

                                            if ((itemDetails == null) || (itemDetails.status != "0")) {
                                                notIssuedItems(itemId);
                                            } else {
                                                var currentdate = new Date();
                                                var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getDate() + " " +
                                                    currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
                                                itemDetails.status = datetime;
                                                database.ref('Inventory/' + key).update(itemDetails);
                                            }

                                            if (itemId == finalItemId && str2 != '')
                                                setTimeout(
                                                    displayModal(str2.substring(0, str2.length - 1) + " : Item(s) are not issued", "OK", function callbackFunc(val) {}),
                                                    5000);

                                        });
                                    });

                                }

                                function notIssuedItems(itemId) {
                                    str2 += itemId + ',';
                                }

                            }

                            returnItemModal.style.display = "none";
                            returnItemModal.innerHTML = returnItemModalContent;

                            if (str != '') {
                                displayModal(str.substring(0, str.length - 1) + " : Item(s) not registered in database", "OK", function callbackFunc(val) {});
                            }
                        }
                        // When the user clicks on <span> (x), close the modal
                    returnItemModalClose.onclick = function() {
                            returnItemModal.style.display = "none";
                            returnItemModal.innerHTML = returnItemModalContent;
                        }
                        // When the user clicks anywhere outside of the modal, close it
                    window.onclick = function(event) {
                        if (event.target == returnItemModal) {
                            returnItemModal.style.display = "none";
                            returnItemModal.innerHTML = returnItemModalContent;
                        }
                    }

                }

            });
        });
    });

    database.ref('Inventory').on('value', function(snapshot) {
        var inventoryList = snapshot.val();

        loader.style.display = "block";

        database.ref('Items').once('value', function(snapshot) {
            var itemsList = snapshot.val();

            database.ref('Users').once('value', function(snapshot) {
                var usersList = snapshot.val();

                database.ref('Event').once("value").then(function(snapshot) {
                    var eventList = snapshot.val();

                    loader.style.display = "none";
                    var fullInventoryListButton = document.getElementById('fullInventoryListButton');
                    fullInventoryListButton.onclick = fullInventoryListButtonClick;
                    var eventInventoryListButton = document.getElementById('eventInventoryListButton');
                    eventInventoryListButton.onclick = eventInventoryListButtonClick;
                    var eventInventoryList = document.getElementById('eventInventoryList');
                    var inventoryListTable = document.getElementById('inventoryListTable');
                    var pageNosDiv = document.getElementById('pageNosDiv');

                    function fullInventoryListButtonClick(eventObj) {
                        eventInventoryList.style.display = "none";
                        pageNosDiv.style.display = "none";
                        displayInventoryList(eventObj.target, 1);
                    }

                    function eventInventoryListButtonClick() {
                        var str = "";
                        var buttonId = "";
                        for (var key in eventList) {

                            buttonId = key + "showButton";
                            str += '<button type="button" class="buttonA" id="' + buttonId + '">' +
                                eventList[key].name + ', ' + eventList[key].place + '</button></br>';
                        }
                        eventInventoryList.innerHTML = str;
                        eventInventoryList.style.display = "block";
                        inventoryListTable.style.display = "none";
                        pageNosDiv.style.display = "none";

                        for (var key in eventList) {
                            var buttonId = '' + key + 'showButton';
                            var button = document.getElementById(buttonId);

                            button.onclick = function(eventObj) {
                                for (var key in eventList) {
                                    var buttonId = '' + key + 'showButton';
                                    if (eventObj.target.id == buttonId) {
                                        eventObj.target.style.fontWeight = 'bold';
                                        eventObj.target.style.color = '#B46D6A';
                                    } else {
                                        var button = document.getElementById(buttonId);
                                        button.style.fontWeight = 'normal';
                                        button.style.color = '#FFFFFF';
                                    }
                                }
                                displayInventoryList(eventObj.target, 1);
                            };

                        }

                    }

                    function displayInventoryList(eventObjTarget, currPageNo) {

                        var str = '';
                        var str2 = '<p style="display:inline-block"> Page(s):  </p>';
                        var displayList = {};
                        var tempDisplayList = {};
                        var pageNos;
                        var itemsToSkip;
                        var ct = 1;

                        if (eventObjTarget.id == "fullInventoryListButton") {
                            tempDisplayList = inventoryList;
                        } else {
                            eventKey = eventObjTarget.id.substring(0, eventObjTarget.id.length - 10);
                            for (var key in eventList[eventKey].items) {
                                tempDisplayList[key] = inventoryList[key];
                            }
                        }

                        pageNos = Math.ceil(Object.keys(tempDisplayList).length / 20);
                        itemsToSkip = Object.keys(tempDisplayList).length - (currPageNo * 20);

                        for (var key in tempDisplayList) {

                            if (ct <= itemsToSkip) {
                                //do nothing
                            } else if (ct > itemsToSkip + 20) {
                                break;
                            } else {
                                displayList[key] = tempDisplayList[key];
                            }
                            ct++;
                        }

                        for (var key in displayList) {

                            if (displayList.hasOwnProperty(key)) {
                                //converting firebase data to html
                                var buttonId = '' + key + 'button';
                                var userName = usersList[displayList[key].id].name;
                                var eventKey = displayList[key].event;
                                var buttonText = "";
                                var returnText = "";
                                var itemId = displayList[key].item;
                                var itemDetails = "";

                                if (displayList[key].status == "0") {
                                    buttonText = "Return";
                                    returnText = "Not Returned.\n Expected by " + eventList[eventKey].end;
                                } else {
                                    buttonText = "x";
                                    returnText = "Returned at " + displayList[key].status;
                                }

                                if (itemsList.hasOwnProperty(itemId)) {
                                    itemDetails = itemsList[itemId].type + " (" + itemsList[itemId].details + ")";
                                } else {
                                    itemDetails = "";
                                }

                                str = "<tr> <td>" + itemId + "</td><td>" + itemDetails + "</td><td>" + eventList[eventKey].name + "," + eventList[eventKey].place +
                                    "</td><td>" + userName + "</td><td>" + displayList[key].time + "</td><td>" + returnText +
                                    '</td><td><button class="buttonA" id="' + buttonId + '">' + buttonText + '</button></td></tr>' + str;

                            }
                        }
                        str = '<thead><th colspan="6"> INVENTORY LIST </th></thead><th>Item Number</th> <th>Item Details</th> <th>Event</th> <th>Issued To</th> <th>Issue Time</th> <th>Return Time</th>' +
                            str;
                        if (Object.keys(displayList).length === 0) {
                            str = '<thead><th colspan="6"> NO ITEMS IN EVENT </th></thead>';
                        }


                        inventoryListTable.innerHTML = str;
                        inventoryListTable.style.display = "table";

                        if (pageNos >= 2) {

                            for (var i = 1; i <= pageNos; i++) {
                                str2 += '<button id="pageNo' + i + '" class="buttonA">' + i + '</button>';
                            }

                            str2 += '<hr>'
                            pageNosDiv.innerHTML = str2;

                            var currPageButton = document.getElementById('pageNo' + currPageNo);
                            currPageButton.style.fontWeight = "bold";
                            currPageButton.style.color = "#B46D6A";

                            //setting listeners for page numbers
                            for (var i = 1; i <= pageNos; i++) {

                                var buttonId = 'pageNo' + i;
                                var button = document.getElementById(buttonId);
                                button.onclick = function(eventObj) {

                                    var eventObjId = eventObj.target.id;
                                    var pageId = parseInt(eventObjId.substring(6, eventObjId.length), 10);
                                    var fullInventoryListButton = document.getElementById('fullInventoryListButton');
                                    if (eventInventoryList.style.display == "none") {
                                        displayInventoryList(fullInventoryListButton, pageId);
                                    } else {
                                        for (var key in eventList) {
                                            var buttonId = '' + key + 'showButton';
                                            var button = document.getElementById(buttonId);
                                            if (button != null) {
                                                if (button.style.fontWeight == 'bold') {
                                                    displayInventoryList(button, pageId);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            pageNosDiv.style.display = "inline-block";

                        } else {
                            pageNosDiv.style.display = "none";
                        }

                        //setting listeners for delete/return event button
                        for (var key in displayList) {

                            var buttonId = '' + key + 'button';
                            var button = document.getElementById(buttonId);
                            button.onclick = deleteOrReturnItemClick;

                        }

                        //listener for deleting/returning item
                        function deleteOrReturnItemClick(eventObj) {
                            var buttonId = eventObj.target.id;
                            var itemId = buttonId.substring(0, buttonId.length - 6);
                            var itemEntry = inventoryList[itemId];
                            if (itemEntry.status == "0") {
                                //return item code
                                var currentdate = new Date();
                                var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getDate() + " " +
                                    currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
                                itemEntry.status = datetime;
                                database.ref('Inventory/' + itemId).update(itemEntry);
                            } else {
                                //delete item code

                                displayModal("You sure? All records of this issue will be deleted.", "Yep", function callbackFunc(val) {
                                    if (val) {
                                        database.ref('Event/' + itemEntry.event + '/items/' + itemId).remove();
                                        database.ref('Items/' + itemEntry.item + '/history/' + itemId).remove();
                                        database.ref('Inventory/' + itemId).remove();
                                    }
                                });

                            }
                        }
                    }

                    if (eventInventoryList.style.display == "none") {
                        displayInventoryList(fullInventoryListButton, 1);
                    } else {
                        for (var key in eventList) {
                            var buttonId = '' + key + 'showButton';
                            var button = document.getElementById(buttonId);
                            if (button != null) {
                                if (button.style.fontWeight == 'bold') {
                                    displayInventoryList(button, 1);
                                    break;
                                }
                            }
                        }
                    }
                });
            });
        });
    });
}

function membersButtonClick() {

    tabButtonClick('membersDiv');

    var loader = document.getElementById('loader');
    loader.style.display = "block";

    var membersTable = document.getElementById('membersTable');

    database.ref('Users').once('value', function(snapshot) {

        var str = '<thead><th colspan="4">MEMBERS</th></thead><th>Name</th> <th>Role</th> <th>Contact</th> <th>BITS ID</th>';
        var membersList = snapshot.val();
        var roleText = "";

        for (var key in membersList) {
            switch (membersList[key].role) {
                case 0:
                    roleText = "AVU Unit/Faculty";
                    break;
                case 1:
                    roleText = "Co-ordinator";
                    break;
                case 2:
                    roleText = "Core Member";
                    break;
                case 3:
                    roleText = "Crew Member";
                    break;
                default:
                    roleText = "";

            }
            str += "<tr> <td>" + membersList[key].name + "</td><td>" + roleText +
                "</td><td>" + membersList[key].phone + "</td><td>" + key + "</td></tr>";
        }
        membersTable.innerHTML = str;
        loader.style.display = "none";
    });

}

function referencesButtonClick() {

  tabButtonClick('referencesDiv');


}

function itemsButtonClick() {

    tabButtonClick('itemsDiv');

    var loader = document.getElementById('loader');

    //add item modal comes here
    var addItemModal = document.getElementById('addItemModal');
    var addItemModalContent = addItemModal.innerHTML;
    var addItemButton = document.getElementById('addItemButton');
    var itemTypeList = ["XLR", "5-5", "M-5", "F-5", "Power Cable", "Power Cable Extender", "Speakon", "Ahuja Wire", "Misc", "Extension Box",
        "PG 58", "PL 80a", "SM 58", "SM 57", "PL 37", "Shure Wireless Mic", "AKG Wireless", "New DI", "Old DI", "Analog DI",
        "Old Mic", "Podium Mic", "Shure Receiver", "Sennheiser Wireless Mic", "Sennheiser Receiver", "StudioMaster Wireless Mic", "StudioMaster Receiver",
        "DAS Speaker", "Ahuja Speaker", "JBL Speaker", "TonyLee Amp", "Ahuja Amp", "Studiomaster Amp",
        "Long Mic Stand", "Short Mic Stand", "Studiomaster Mixer", "AKG Wireless Collar Mic","EV Speakers",
        "Tube Holder", "Fader Strip", "PAR Cans", "Halo", "LED", "AKG Wired", "Shure Headworn", "Shure PG58 Wireless"
    ];

    addItemButton.onclick = function() {


        var addItemModalClose = document.getElementById('addItemModalClose');
        // When the user clicks on the button, open the modal

        var itemTypeSelect = document.getElementById('itemTypeSelect');

        var str = '';
        for (var key in itemTypeList) {
            str += '<option>' + itemTypeList[key] + '</option>';
        }
        itemTypeSelect.innerHTML = str;

        addItemModal.style.display = "block";

        var validateAddItemButton = document.getElementById('validateAddItemButton');
        validateAddItemButton.onclick = function(eventObj) {

            var selOption = itemTypeSelect.options[itemTypeSelect.selectedIndex].innerHTML;
            var addItemId = document.getElementById('addItemId');
            var addItemAttributes = document.getElementById('addItemAttributes');

            var itemEntry = {
                type: selOption,
                details: addItemAttributes.value
            };
            database.ref('Items/' + addItemId.value).set(itemEntry);
            addItemModal.style.display = "none";
            addItemModal.innerHTML = addItemModalContent;
        }

        // When the user clicks on <span> (x), close the modal
        addItemModalClose.onclick = function() {
                addItemModal.style.display = "none";
                addItemModal.innerHTML = addItemModalContent;
            }
            // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == addItemModal) {
                addItemModal.style.display = "none";
                addItemModal.innerHTML = addItemModalContent;
            }
        }

    }

    //delete item modal comes here
    var deleteItemModal = document.getElementById('deleteItemModal');
    var deleteItemModalContent = deleteItemModal.innerHTML;
    var deleteItemButton = document.getElementById('deleteItemButton');

    deleteItemButton.onclick = function() {


        var deleteItemModalClose = document.getElementById('deleteItemModalClose');
        // When the user clicks on the button, open the modal

        deleteItemModal.style.display = "block";

        var validateDeleteItemButton = document.getElementById('validateDeleteItemButton');
        validateDeleteItemButton.onclick = function(eventObj) {

            var deleteItemId = document.getElementById('deleteItemId');

            database.ref('Items/' + deleteItemId.value).remove();
            deleteItemModal.style.display = "none";
            deleteItemModal.innerHTML = deleteItemModalContent;
        }

        // When the user clicks on <span> (x), close the modal
        deleteItemModalClose.onclick = function() {
                deleteItemModal.style.display = "none";
                deleteItemModal.innerHTML = deleteItemModalContent;
            }
            // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == deleteItemModal) {
                deleteItemModal.style.display = "none";
                deleteItemModal.innerHTML = deleteItemModalContent;
            }
        }

    }

    var itemsTypeListDiv = document.getElementById('itemsTypeListDiv');
    var itemsListDiv = document.getElementById('itemsListDiv');

    var str = "<p>";
    var buttonId = "";
    for (var key in itemTypeList) {

        buttonId = itemTypeList[key].replace(" ", "_") + "showButton";
        str += '<button type="button" class="buttonA" id="' + buttonId + '">' +
            itemTypeList[key] + '</button></br>';
        if ((parseInt(key) + 1) % 10 == 0)
            str += "</p><p>"
    }

    str += "</p>";

    itemsTypeListDiv.innerHTML = str;
    itemsTypeListDiv.style.display = "block";
    itemsListDiv.style.display = "none";
    loader.style.display = "block";

    database.ref('Users').once("value", function(snapshot) {
        var usersList = snapshot.val();

        database.ref('Inventory').on('value', function(snapshot) {
            var inventoryList = snapshot.val();

            loader.style.display = "block";
            database.ref('Items').once('value', function(snapshot) {
                var itemsList = snapshot.val();

                database.ref('Event').once("value", function(snapshot) {
                    var eventList = snapshot.val();

                    for (var key in itemTypeList) {

                        buttonId = itemTypeList[key].replace(" ", "_") + "showButton";
                        var button = document.getElementById(buttonId);

                        button.onclick = function(eventObj) {
                            for (var key in itemTypeList) {
                                var buttonId = itemTypeList[key].replace(" ", "_") + "showButton";
                                if (eventObj.target.id == buttonId) {
                                    eventObj.target.style.fontWeight = 'bold';
                                    eventObj.target.style.color = '#B46D6A';
                                } else {
                                    var button = document.getElementById(buttonId);
                                    button.style.fontWeight = 'normal';
                                    button.style.color = '#FFFFFF';
                                }
                            }
                            displayItemsList(eventObj.target);
                        }
                    }

                    for (var key in itemTypeList) {
                        var buttonId = itemTypeList[key].replace(" ", "_") + "showButton";
                        var button = document.getElementById(buttonId);
                        if (button.style.fontWeight == 'bold') {
                            displayItemsList(button);
                            //break;
                        }
                    }

                    loader.style.display = "none";

                    function displayItemsList(eventObjTarget) {

                        var itemType = eventObjTarget.id.substring(0, eventObjTarget.id.length - 10).replace("_", " ");
                        var str = "<p>";
                        var buttonId = "";
                        var ct = 0,
                            ct2 = 0;
                        var displayList = {};
                        var issuedDisplayList = {};

                        for (var itemId in itemsList) {
                            if (itemsList[itemId].type == itemType) {
                                buttonId = itemId + "showButton";
                                str += '<button type="button" class="buttonA" id="' + buttonId + '">' +
                                    itemId + '</button></br>';
                                displayList[ct++] = itemId;
                                var itemHistory = itemsList[itemId].history;
                                if (itemHistory != null) {
                                    var historyKeys = Object.keys(itemHistory);
                                    var lastKey = historyKeys[historyKeys.length - 1];
                                    var itemDetails = inventoryList[lastKey];
                                    if (itemDetails.status == "0")
                                        issuedDisplayList[ct2++] = itemId;
                                }
                                if (ct % 10 == 0)
                                    str += "</p><p>"
                            }
                        }

                        str += "</p>";

                        var itemStats = '<div style="text-align:center"><p>Total : ' + ct + '</p>' + '<p>Issued : ' + ct2 + '</p>' + '<p>Available : ' + (ct - ct2) + '</p></div>';

                        if (str == "<p></p>")
                            str = '<h3 style="font-weight: bold; text-align: center;"> NO ITEMS IN THIS CATEGORY </h3>';
                        else
                            str = '<h3 style="font-weight: bold; text-align: center;"> ITEM LIST </h3><br>' + str +itemStats;

                        itemsListDiv.innerHTML = str;

                        for (var key in issuedDisplayList) {
                            buttonId = '' + issuedDisplayList[key] + 'showButton';
                            var button = document.getElementById(buttonId);
                            button.style.color = '#B43232';
                        }

                        itemsListDiv.style.display = "block";

                        for (var key in displayList) {
                            buttonId = '' + displayList[key] + 'showButton';
                            var button = document.getElementById(buttonId);
                            button.onclick = showItemDetails;
                        }

                        function showItemDetails(eventObj) {

                            var displayItemModal = document.getElementById('displayItemModal');
                            var displayItemModalTable = document.getElementById('displayItemModalTable');
                            var displayItemModalHeading = document.getElementById('displayItemModalHeading');
                            var displayItemModalDetails = document.getElementById('displayItemModalDetails');
                            var displayItemModalClose = document.getElementById('displayItemModalClose');
                            // When the user clicks on the button, open the modal

                            var itemId = eventObj.target.id.substring(0, 6);

                            var itemHistory = itemsList[itemId].history;
                            var str = "";
                            var str2 = "";

                            for (var key in itemHistory) {
                                var issueDetails = inventoryList[key];
                                var userName = usersList[issueDetails.id].name;
                                var eventKey = issueDetails.event;
                                var returnText = "";

                                if (issueDetails.status == "0") {
                                    returnText = "Not Returned.\n Expected by " + eventList[eventKey].end;
                                } else {
                                    returnText = "Returned at " + issueDetails.status;
                                }

                                str = "<tr><td>" + eventList[eventKey].name + "," + eventList[eventKey].place +
                                    "</td><td>" + userName + "</td><td>" + issueDetails.time + "</td><td>" + returnText +
                                    '</td></tr>' + str;

                            }

                            str = '<thead><th colspan="4"> HISTORY </th></thead> <th>Event</th> <th>Issued To</th> <th>Issue Time</th> <th>Return Time</th>' +
                                str;
                            if (itemHistory == null) {
                                str = '<thead><th colspan="4"> NO HISTORY </th></thead>';
                            }
                            str2 = "Type : " + itemsList[itemId].type + "<br> Details : " + itemsList[itemId].details;

                            displayItemModalTable.innerHTML = str;
                            displayItemModalHeading.innerHTML = itemId;
                            displayItemModalDetails.innerHTML = str2;
                            displayItemModal.style.display = "block";
                            loader.style.display = "none";

                            // When the user clicks on <span> (x), close the modal
                            displayItemModalClose.onclick = function() {
                                    displayItemModal.style.display = "none";
                                }
                                // When the user clicks anywhere outside of the modal, close it
                            window.onclick = function(event) {
                                if (event.target == displayItemModal) {
                                    displayItemModal.style.display = "none";
                                }
                            }

                        }
                    }
                });
            });
        });
    });

}
