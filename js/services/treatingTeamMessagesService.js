var myApp = angular.module('MUHCApp');

myApp.service('TreatingTeamMessages', ['$filter', 'RequestToServer', 'UserPreferences', function($filter, RequestToServer, UserPreferences) {
    // Array where all the current Treating Team Messages are Stored
    var treatingTeamMessagesArray = [];

    function deleteTreatingTeamMessages(treatingTeamMessages) {
        for(var i = 0; i < treatingTeamMessagesArray.length; i++) {
            for(var j = 0; j < treatingTeamMessages.length; j++) {
                if(treatingTeamMessagesArray[i].TxTeamMessageSerNum == treatingTeamMessages[j].TxTeamMessageSerNum) { // if same object
                    treatingTeamMessagesArray.splice(i, 1); // delete object in treatingTeamMessagesArray to be added later using the addTreatingTeamMessages function 
                }
            }
        }
    }

    // Add new Treating Team Message to the txTeamMessagesArray
    function addTreatingTeamMessages(newMessages) { // where newMessages is the array of new messages
        // If the Array (object) is undefined, return
        if(typeof newMessages == 'undefined') {
            return;
        }
        
        for(var i = 0; i < newMessages.length; i++) {
            if(typeof newMessages[i] == 'undefined') { // if newMessages[i] is undefined, then skip it and continue adding the other defined messages objects
                continue;
            }
            // format date to javascript for later use in controllers
            newMessages[i].DateAdded = $filter.('formatDate') (newMessages[i].DateAdded);
            // Add the newMessages to the txTeamMessagesArray
            treatingTeamMessagesArray.push(newMessages[i]);
        }
    }

    return { // public functions start here
        // set treatingTeamMessagesArray 
        setTreatingTeamMessagesArray: function(newMessages) {
            // create empty array
            var treatingTeamMessagesArray = [];
            // Initialize the array by adding messages to it
            addTreatingTeamMessages(newMessages);
        },

        // get treatingTeamMessagesArray
        getTreatingTeamMessagesArray: function() {
            return treatingTeamMessagesArray;
        },

        // get unread messages for the notifications view
       getUnreadTreatingTeamMessages: function() {
            var unreadMessages = [];
            // circle through treatingTeamMessagesArray array and check ReadStatus
            // circle from end to beginning so that when we add to unreadMessages, the objects are already sorted and ready to be displayed
            for(var i = treatingTeamMessagesArray.length-1; i >= 0; i--) { 
                if(treatingTeamMessagesArray[i].ReadStatus == '0') {
                    unreadMessages.push(treatingTeamMessagesArray[i]);
                }
            }
            return unreadMessages;
        },

        // Get the number of unread treating team messages for the badges
        getNumberUnreadTreatingTeamMessages: function() {
            // initialize number to return
            var toRet = 0;
            for(var i = 0; i < treatingTeamMessagesArray.length; i++) {
                if(treatingTeamMessagesArray[i].ReadStatus == '0') {
                    toRet += 1;
                }
            }
            return toRet;
        },

        // get a treating team message by TxTeamMessageSerNum
        getTreatingTeamMessageBySerNum: function(serNum) {
            for(var i = 0; i < treatingTeamMessagesArray.length; i++) {
                if(treatingTeamMessagesArray[i].TxTeamMessageSerNum == serNum) {
                    return angular.copy(treatingTeamMessagesArray[i]);
                }
            }
        },

        // Update ReadStatus for the UI and the backend by SerNum
        updateReadStatusTreatingTeamMessageBySerNum: function(serNum) {
            for(var i = 0; i < treatingTeamMessagesArray.length; i++) {
                if(treatingTeamMessagesArray[i].TxTeamMessageSerNum == serNum) {
                    treatingTeamMessagesArray[i].ReadStatus = '1'; // Update for UI
                    RequestToServer.sendRequest('Read', {'Id':treatingTeamMessagesArray[i].TxTeamMessageSerNum, 'Field':'TxTeamMessages'}); // Update backend (in database)
                }
            }
        },

        // get name of treating team message in French or English by TxTeamMessageSerNum
        getTreatingTeamMessageName: function(serNum) {
            for(var i = 0; i < treatingTeamMessagesArray.length; i++) {
                if(treatingTeamMessagesArray[i].TxTeamMessageSerNum == serNum) {
                    return { NameEN: treatingTeamMessagesArray[i].PostName_EN, NameFR: treatingTeamMessagesArray[i].PostName_FR};
                }
            }
        },

        // Synchronize treating team messages and ReadStatus changes
        updateTreatingTeamMessagesArray: function(treatingTeamMessages) {  
            // Delete the outdated messages
            deleteTreatingTeamMessages(treatingTeamMessages);
            // Add the updated messages to treatingTeamMessagesArray
            addTreatingTeamMessages(treatingTeamMessages);
        },

        // set language of treating team messages according to user preferences
        setTreatingTeamMessagesLanguage: function(treatingTeamMessages) {
            // get the language from the User Preferences Service
            var language = UserPreferences.getLanguage();

            if(Object.prototype.toString.call(treatingTeamMessages) == '[object Array]') { // if the argument passed is an array
                // perform operation on array
                for(var i = 0; i < treatingTeamMessages.length; i++) {
                    treatingTeamMessages[i].Title = (language == 'EN') ? treatingTeamMessages[i].PostName_EN : treatingTeamMessages[i].PostName_FR;
                    treatingTeamMessages[i].Body = (language == 'EN') ? treatingTeamMessages[i].Body_EN : treatingTeamMessages[i].Body_FR;
                }
            } else if(typeof(treatingTeamMessages) == 'object') { // if argument passed is an object
                // perfom operation on object
                treatingTeamMessages.Title = (language == 'EN') ? treatingTeamMessages.PostName_EN : treatingTeamMessages.PostName_FR;
                treatingTeamMessages.Body = (language == 'EN') ? treatingTeamMessages.Body_EN : treatingTeamMessages.Body_FR;
            } else { // wrong argument passed
                return;
            }
        }

    } // public functions end here
}]); // end of service