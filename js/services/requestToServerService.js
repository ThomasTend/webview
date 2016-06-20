/**
*
*
*
**/
myApp.service('RequestToServer',function(UserAuthorizationInfo, EncryptionService, $http,$q){
    function getIdentifierWeb()
    {
      var r=$q.defer();
      r.resolve('DE83B0B8-546E-4FB3-9930-50F5111778CD');
      return r.promise;
    }
    var identifier='DE83B0B8-546E-4FB3-9930-50F5111778CD';
    return{
        sendRequest:function(typeOfRequest,content){
            var Ref=new Firebase('https://brilliant-inferno-7679.firebaseio.com/requests');
            var userID=UserAuthorizationInfo.UserName;
            console.log(identifier);
            var encryptedRequestType=EncryptionService.encryptData(typeOfRequest);
            content= EncryptionService.encryptData(content);
            console.log(content);
            if(typeOfRequest=='Login'||typeOfRequest=='Logout')
            {
              Ref.push({ 'Request' : encryptedRequestType,'DeviceId':identifier,  'UserID': userID })
            }else if(typeOfRequest=='Refresh')
            {
              Ref.push({ 'Request' : encryptedRequestType,'DeviceId':identifier,  'UserID': userID, 'Parameters':content })
            }
            else if (typeOfRequest=="NewNote"||typeOfRequest=="EditNote"||typeOfRequest=="DeleteNote"||typeOfRequest=="AccountChange"||typeOfRequest=="AppointmentChange"||typeOfRequest=="Message"||typeOfRequest=="Feedback")
            {
              Ref.push({'Request': encryptedRequestType,'DeviceId':identifier, 'UserID':userID, 'Parameters':content});
            }
            else if (typeOfRequest=='Checkin')
            {
              Ref.push({ 'Request' : encryptedRequestType, 'DeviceId':identifier,'UserID':userID, 'Parameters':{'AppointmentSerNum' : content}});
            }
            else if (typeOfRequest=='MessageRead')
            {
              Ref.push({ 'Request' : encryptedRequestType, 'DeviceId':identifier,'UserID':userID, 'Parameters':{'MessageSerNum' : content }});
            }
            else if (typeOfRequest=='NotificationRead')
            {
              console.log('pushing notification');
              Ref.push({ 'Request' : encryptedRequestType, 'DeviceId':identifier,'UserID':userID, 'Parameters':{'NotificationSerNum' : content }});
            }

        },
        setIdentifier:function()
        {
          var r=$q.defer();
          var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
          if(app){
            /*
            *Use apps unique identifier
            */

          }else{
            getIdentifierWeb().then(function(uuid){
              console.log(uuid);
              identifier=uuid;
              r.resolve(uuid);
            });
            r.resolve('DE83B0B8-546E-4FB3-9930-50F5111778CD')
          }
          return r.promise;
        },
        getIdentifier:function()
        {
          return identifier;
        }
    };



});
