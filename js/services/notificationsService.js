var myApp=angular.module('MUHCApp');
/**
*
*
*
*
**/
myApp.service('Notifications',['$rootScope','$filter','RequestToServer', function($rootScope,$filter,RequestToServer){
    this.notifications={};
    function setNotificationsNumberAlert(){
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
    return{
        setUserNotifications:function(notifications){
            this.Notifications=[];
            $rootScope.Notifications=0;
            if(notifications===undefined){
                setNotificationsNumberAlert();
               return;
            }
            var notificationsKeys=Object.keys(notifications);
            for (var i = 0; i < notificationsKeys.length; i++) {
                notifications[notificationsKeys[i]].DateAdded=$filter('formatDate')(notifications[notificationsKeys[i]].DateAdded);
                if(notifications[notificationsKeys[i]].ReadStatus==='0'){
                    $rootScope.Notifications+=1;
                }
                this.Notifications.push(notifications[notificationsKeys[i]]);
            };
            console.log(this.Notifications);
            this.Notifications=$filter('orderBy')(this.Notifications,'DateAdded',true);
            console.log(this.Notifications);
            setNotificationsNumberAlert();
        },
         getUserNotifications:function(){
            var testArray = [{Type: 'Appointment', Name: 'Notification', Content: 'New Appointment', ReadStatus: '0', DateAdded: '29/01/2016'}, {Type: 'Appointment', Name: 'Notification', Content: 'New Appointment', ReadStatus: '0', DateAdded: '28/01/2016'}, {Type: 'Document', Name: 'Notification', Content: 'New Appointment', ReadStatus: '1', DateAdded: '19/01/2016'}];
            return testArray//this.Notifications;
        },
        setNotificationReadStatus:function(notificationIndex){
            this.Notifications[notificationIndex].ReadStatus='1';
            RequestToServer.sendRequest('Notification',this.Notifications[notificationIndex].NotificationSerNum);
        },
        getNotificationReadStatus:function(notificationIndex){
            return this.notifications[notificationIndex].ReadStatus;
        }
    };

}]);
