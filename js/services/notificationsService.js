var myApp=angular.module('MUHCApp');
/**
*
*
*
*
**/
myApp.service('Notifications',['$rootScope','$filter','RequestToServer', function($rootScope,$filter,RequestToServer) {


var testArray = [{Type: 'Announcement', Name: 'Announcement', Content: 'New Announcement', ReadStatus: '0', DateAdded: '29/01/2016', NotificationSerNum: '20'},{Type: 'TxTeamMessage', Name: 'TxTeamMessage', Content: 'New TxTeamMessage', ReadStatus: '0', DateAdded: '29/01/2016', NotificationSerNum: '20'},{Type: 'Appointment', Name: 'Notification', Content: 'New Appointment', ReadStatus: '0', DateAdded: '29/01/2016', NotificationSerNum: '12'}, {Type: 'Appointment', Name: 'Notification', Content: 'New Appointment', ReadStatus: '0', DateAdded: '28/01/2016', NotificationSerNum: '13'}, {Type: 'Document', Name: 'Document', Content: 'New Document', ReadStatus: '0', DateAdded: '19/01/2016', NotificationSerNum: '14'}, {Type: 'Document', Name: 'Document', Content: 'New Document', ReadStatus: '1', DateAdded: '19/01/2016', NotificationSerNum: '14'}, {Type: 'Document', Name: 'Document', Content: 'New Document', ReadStatus: '1', DateAdded: '19/01/2016', NotificationSerNum: '14'}, {Type: 'Document', Name: 'Document', Content: 'New Document', ReadStatus: '1', DateAdded: '19/01/2016', NotificationSerNum: '14'}];

    // Get number of unread notifications by Type
    
    var numNewAnnouncements = 0;
    var numNewTxTeamMessages = 0;
    var numNewDocuments = 0;
    var numNewAppointments = 0;

    for(var i = 0; i < testArray.length; i++) {
        if(testArray[i].ReadStatus === '0') {
            if(testArray[i].Type === 'Announcement') {
              numNewAnnouncements += 1;
            }
            if(testArray[i].Type === 'TxTeamMessage') {
              numNewTxTeamMessages += 1;
            }
            if(testArray[i].Type === 'Appointment') {
              numNewAppointments += 1;
            }
            if(testArray[i].Type === 'Document') {
              numNewDocuments += 1;
            }
        }
    }
    $rootScope.Announcements = numNewAnnouncements;
    $rootScope.TxTeamMessages = numNewTxTeamMessages;
    $rootScope.Appointments = numNewAppointments;
    $rootScope.Documents = numNewDocuments;

    function setNotificationsNumberAlert() {
        $rootScope.TotalNumberOfNews=$rootScope.Notifications+$rootScope.NumberOfNewMessages;
        if($rootScope.TotalNumberOfNews===0)$rootScope.TotalNumberOfNews='';
        if($rootScope.NumberOfNewMessages===0) $rootScope.NumberOfNewMessages='';
        if($rootScope.Notifications===0) {
            $rootScope.Notifications='';
            $rootScope.noNotifications=true;
        }else{
            $rootScope.noNotifications=false;
        }
    }
        
    return {
        setUserNotifications:function(notifications) {
            this.Notifications=[];
            $rootScope.Notifications=0;
            if(notifications===undefined){
                setNotificationsNumberAlert();
               return;
            }
            var notificationsKeys=Object.keys(notifications);
            for (var i = 0; i < notificationsKeys.length; i++) {
                notifications[notificationsKeys[i]].DateAdded=$filter('formatDate')(notifications[notificationsKeys[i]].DateAdded);
                if(notifications[notificationsKeys[i]].ReadStatus==='0') {
                    $rootScope.Notifications+=1;
                }
                this.Notifications.push(notifications[notificationsKeys[i]]);
            };
            console.log(this.Notifications);
            this.Notifications=$filter('orderBy')(this.Notifications,'DateAdded',true);
            console.log(this.Notifications);
            setNotificationsNumberAlert();
        },

         getUserNotifications:function() {
            return testArray;//this.Notifications;
        },
        setNotificationReadStatus:function(notificationIndex) { 
            testArray[notificationIndex].ReadStatus = '1';
            //this.Notifications[notificationIndex].ReadStatus='1';

            RequestToServer.sendRequest('Notification',testArray[notificationIndex].NotificationSerNum);
        },
        getNotificationReadStatus:function(notificationIndex) {
            return this.notifications[notificationIndex].ReadStatus;
        }
    };

}]);
