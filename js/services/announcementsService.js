var myApp = angular.module('MUHCApp');

myApp.service('Announcements', ['$filter', 'RequestToServer', 'UserPreferences', function($filter, RequestToServer, UserPreferences) {
    // Array where all the current announcements are stored
    var announcementsArray = [];

    function deleteAnnouncements(newAnnouncements) {
        for(var i = 0; i < announcementsArray.length; i++) {
            for(var j = 0; j < newAnnouncements.length; j++) {
                if(announcementsArray[i].AnnouncementSerNum == newAnnouncements[j].AnnouncementSerNum) { // if same object
                    announcementsArray.splice(i, 1); // delete object in announcementsArray to be added later using the addAnnouncements function
                }
            }
        }
    }

    // Add new Announcement to the announcementsArray
    function addAnnouncements(newAnnouncements) {
        // If the Array (object) is undefined, return
        if(typeof newAnnouncements == undefined) {
            return;
        }

        for(var i = 0; i < newAnnouncements.length; i++) {
            if(typeof newAnnouncements[i] == 'undefined') { // if newMessages[i] is undefined, then skip it and continue adding the other defined messages objects
                continue;
            }
            // format date to javascript for later use in controllers
            newAnnouncements[i].DateAdded = $filter.('formatDate') (newAnnouncements[i].dateAdded);
            // Add the new announcement to the announcementsArray
            announcementsArray.push(newAnnouncements[i]);
        }
    } 

    return { // public functions start here
        // set announcementsArray
        setAnnouncementArray: function(newAnnouncements) {
            // create empty array
            var announcementsArray = [];
            // Initialize the array by adding messages to it
            addAnnouncements(newAnnouncements);
        },

        // get announcementsArray
        getAnnouncementsArray: function() {
            return announcementsArray;
        },

        // Synchronize announcements and ReadStatus changes
        updateAnnouncementsArray: function(newAnnouncements) {
            // delete the outdated announcements
            deleteAnnouncements(newAnnouncements);
            // add the updated announcements to announcementsArray
            addAnnouncements(newAnnouncements);
        },

        // get unread announcements for notifications view
        getNumberUnreadAnnouncements: function() {
            var unreadAnnouncements = [];
            // circle through announcementsArray array and check ReadStatus
            // circle from end to beginning so that when we add to unreadAnnouncements, the objects are already sorted and ready to be displayed
            for(var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].ReadStatus == '0') {
                    unreadAnnouncements.push(announcementsArray[i]);
                }
            }
            return unreadAnnouncements;
        },

        // get the number of unread announcements for badges
        getNumberunreadAnnouncements: function() {
            // initialize number to return
            var toRet = 0;
            for(var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].ReadStatus == '0') {
                    toRet += 1;
                }
            }
            return toRet;
        },

        // get announcement by AnnouncementSerNum
        getAnnouncementBySerNum: function(serNum) {
            for(var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].AnnouncementSerNum == serNum) {
                    return angular.copy(announcementsArray[i]);
                }
            }
        },

        // read announcement by AnnouncementSerNum
        readAnnouncementBySerNum: function(serNum) {
            for(var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].AnnouncementSerNum == serNum) {
                    announcementsArray[i].ReadStatus = '1';
                    RequestToServer.sendRequest('Read', {'Id': serNum, 'Field': 'Announcements'});
                }
            }
        },

        // read announcement by index and AnnouncementSerNum
        readAnnouncementByIndexAndSerNum: function(index, serNum) {
            announcementArray[index].ReadStatus = '1';
            RequestToServer.sendRequest('Read', {'Id': serNum, 'Field': 'Announcements'});
        },

        // get announcement's name in French or English by AnnouncementSerNum
        getAnnouncementName: function(serNum) {
            for(var i = 0; i < announcementsArray.length; i++) {
                if(announcementsArray[i].AnnouncementSerNum == serNum) {
                    return {NameEN: announcementsArray[i].PostName_EN, NameFR: announcementsArray[i].PostName_FR};
                }
            }
        },

        // set announcements' language according to user preferences
        setAnnouncementsLanguage: function(announcements) {
            // get the language from the User Preferences Service
            var language = UserPreferences.getLanguage();

            if(Object.prototype.toString.call(announcements) == '[object Array]') { // if the argument passed is an array
                // perform operation on array
                for(var i = 0; i < announcements.length; i++) {
                    announcements[i].Title = (language == 'EN') ? announcements[i].PostName_EN : announcements[i].PostName_FR;
                    announcements[i].Body = (language == 'EN') ? announcements[i].Body_EN : announcements[i].Body_FR;
                }
            } else if(typeof(announcements) == 'object') { // if argument passed is an object
                // perfom operation on object
                announcements.Title = (language == 'EN') ? announcements.PostName_EN : announcements.PostName_FR;
                announcements.Body = (language == 'EN') ? announcements.Body_EN : announcements.Body_FR;
            } else { // wrong argument passed
                return;
            }
        }

    } // public functions end here
}]); // end of service