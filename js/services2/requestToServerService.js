var myApp=angular.module('MUHCApp');
/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService, FirebaseService, $http,$q){
    var identifier='';
    var Ref=new Firebase(FirebaseService.getFirebaseUrl()+'requests');
     var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
      if(app){
          identifier=device.uuid;
      }else{
          identifier='browser';
      }
    var lastUpdateTimestamp={};
    /*function initTimestampsFromLocalStorage()
    {
      lastUpdateTimestamp=JSON.parse(window.localStorage.getItem(UserAuthorizationInfo.UserName+'/Timestamps'));
    }*/
    function initTimestamps(time)
    {

      lastUpdateTimestamp={
        'All':time,
        'Appointments':time,
        'Messages':time,
        'Documents':time,
        'Tasks':time,
        'Doctors':time,
        'LabTests':time,
        'Patient':time,
        'Notifications':time,
        'EducationalMaterial':time
      };
      window.localStorage.setItem(UserAuthorizationInfo.UserName+'/Timestamps',JSON.stringify(lastUpdateTimestamp));
    }
    function obtainTimestamp(content)
    {
      if(typeof content=='undefined')
      {
        return lastUpdateTimestamp.All;
      }else if(angular.isArray(content))
      {
        var min=Infinity;
        for (var i = 0; i < content.length; i++) {
          if(min>lastUpdateTimestamp[content[i]])
          {
            min=lastUpdateTimestamp[content[i]];
          }
        }
        return min;
      }else{
        return lastUpdateTimestamp[content];
      }
    }
    return{
        sendRequest:function(typeOfRequest,content){
          //Deciding whether is an app or a website
          console.log('I am in there');
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          var userID=UserAuthorizationInfo.UserName;
          var token=UserAuthorizationInfo.Token;
          var time=(new Date()).getTime();
          var encryptedRequestType=EncryptionService.encryptData(typeOfRequest);
          var timestamp=null;
          console.log(typeOfRequest);
          if(typeOfRequest=='Login'||typeOfRequest=='Resume')
          {
              initTimestamps(time);
          }else if(typeOfRequest=='Refresh')
          {

            /*if(!lastUpdateTimestamp.hasOwnProperty('All')) initTimestampsFromLocalStorage();*/
            timestamp=obtainTimestamp(content);

            console.log(lastUpdateTimestamp);
          }
          content= EncryptionService.encryptData(content);
          if(app){
            //If online send request as normal
            Ref.push({ 'Request' : encryptedRequestType,'DeviceId':identifier, 'Token':token, 'UserID': userID, 'Parameters':content,'Timestamp':timestamp });
          }else{
            //If its not an app just try sending the request
            Ref.push({ 'Request' : encryptedRequestType,'DeviceId':identifier,'Token':token,  'UserID': userID, 'Parameters':content,'Timestamp':timestamp});
          }

        },
        updateTimestamps:function(content,time)
        {
          if(content=='All')
          {
            initTimestamps(time);
          }else if(angular.isArray(content))
          {
            for (var i = 0; i < content.length; i++) {
              lastUpdateTimestamp[content[i]]=time;
            }
          }else{
            lastUpdateTimestamp[content]=time;
          }
          window.localStorage.setItem(UserAuthorizationInfo.UserName+'/Timestamps',JSON.stringify(lastUpdateTimestamp));
        },
        getIdentifier:function()
        {
          return identifier;
        }
    };



});
