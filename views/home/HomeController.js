var myApp=angular.module('MUHCApp');



myApp.controller('HomeController', ['$scope', '$timeout', '$filter', '$location','UserAuthorizationInfo','EncryptionService','Notifications', 'Patient', 'Doctors', 'Appointments','UserPlanWorkflow','$rootScope','UpdateUI','RequestToServer', function ($scope, $timeout, $filter, $location, UserAuthorizationInfo, EncryptionService, Notifications, Patient, Doctors, Appointments, UserPlanWorkflow, $rootScope, UpdateUI, RequestToServer) {


//homeInit();
//$scope.enableCheckin=false;
 /* window.alert('getting data for home controller');
//if(testArray == 'undefined') {
  console.log('boom');
  RequestToServer.sendRequest('Refresh',['Appointments', 'Patient', 'Notifications', 'Doctors', 'UserPlanWorkflow', 'CheckinService', 'UpdateUI'])
  UpdateUI.UpdateSection('Home').then(function(data) {
  window.alert('getting data for home controller');
  //homeInit();
  });*/
//} else {
  homeInit();
//}


function homeInit() {
    // Get number of unread notifications by Type
    
    var numNewAnnouncements = 0;
    var numNewTxTeamMessages = 0;
    var numNewDocuments = 0;
    var numNewAppointments = 0;

    Notifications.setUserNotifications();
    var testArray = Notifications.getUserNotifications();

    for(var i = 0; i < Notifications.getUserNotifications().length; i++) {
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
    console.log(testArray);
    $scope.Announcements = numNewAnnouncements;
    $scope.TxTeamMessages = numNewTxTeamMessages;
    $scope.Appointments = numNewAppointments;
    $scope.Documents = numNewDocuments;

	$scope.dateToday=new Date();
	if(UserPlanWorkflow.isEmpty())
  {
    if(UserPlanWorkflow.isCompleted()){
      $scope.status='In Treatment';
    }else{
      $scope.status='Radiotherapy Treatment Planning';
    }
  }else{
    $scope.status='No treatment plan available!';

    } 
  /*
  if(CheckinService.haveNextAppointmentToday())
  {
    if(!CheckinService.isAlreadyCheckedin())
    {
			CheckinService.isAllowedToCheckin().then(function(value){
				if(value)
        {
					$timeout(function(){
						  $scope.enableCheckin=true;
					})
        }else{
					$timeout(function(){
						  $scope.enableCheckin=false;
					})
        }
			})

    }else{
      $scope.enableCheckin=false;
    }
  }else{
    $scope.enableCheckin=false;
  } */

  if(Appointments.isThereAppointments())
  {
    if(Appointments.isThereNextAppointment()){
        var nextAppointment=Appointments.getUpcomingAppointment();
        $scope.noAppointments=false;
        $scope.appointmentShown=nextAppointment;
        $scope.titleAppointmentsHome='Next Appointment';
    }else{
      var lastAppointment=Appointments.getLastAppointmentCompleted();
      $scope.nextAppointmentIsToday=false;
      $scope.appointmentShown=lastAppointment;
      $scope.titleAppointmentsHome='Last Appointment';
    }
  }else{
      $scope.noAppointments=true;
  }

		$scope.patient=Patient.getPatientFields();
		$scope.primaryPhysician=Doctors.getPrimaryPhysician();
		console.log($scope.primaryPhysician);
		treatmentPlanStatusInit();
}

$scope.checkin=function()
{
	//CheckinService.checkinToAppointment();
	$scope.messageCheckedIn="You have successfully checked in proceed to waiting room!";
	$timeout(function(){
		$scope.enableCheckin=false;
	});


}
function treatmentPlanStatusInit()
{
	$scope.estimatedTime='3 days';
    $scope.finishedTreatment=false;

    var stages=UserPlanWorkflow.getPlanWorkflow();

    var nextStageIndex=UserPlanWorkflow.getNextStageIndex();
    var startColor='#5CE68A';
    var endColor='#3399ff';


        if(stages.length==0){
            $scope.noTreatmentPlan=true;
        } else {

        if(nextStageIndex==stages.length){

            $scope.outOf=nextStageIndex +' out of '+ stages.length;
            $scope.treatmentPlanCompleted=true;
            $scope.percentage=100;
            $scope.completionDate=stages[nextStageIndex-1].Date;
            endColor='#5CE68A';
        }else{
            console.log("In treatmentPlanStatusInit");
            $scope.currentStage=stages[nextStageIndex-1].Name;
            $scope.treatmentPlanCompleted=false;
            $scope.percentage=Math.floor((100*(nextStageIndex))/stages.length);
            console.log($scope.percentage);
            console.log(stages.lenght);
            console.log(nextStageIndex);
            $scope.outOf=nextStageIndex +' out of '+ stages.length;
            $timeout(function(){
               var lastStageFinishedPercentage=Math.floor((100*(nextStageIndex-1))/stages.length);
                var circle2 = new ProgressBar.Circle('#progressStatusPastStages', {
                    color: startColor,
                    duration: 2000,
                    easing: 'easeInOut',
                    strokeWidth: 5,
                    step: function(state, circle) {
                        circle.path.setAttribute('stroke', state.color);
                    }
                });
                circle2.animate(lastStageFinishedPercentage/100, {
                    from: {color: startColor},
                    to: {color: startColor}
                });
            });
           
        }
        $timeout(function(){
          var circle = new ProgressBar.Circle('#progressStatusPresentStage', {
            color: endColor,
            duration: 2000,
            easing: 'easeInOut',
            strokeWidth: 5,
            step: function(state, circle) {
                circle.path.setAttribute('stroke', state.color);
            }
        });
        circle.animate($scope.percentage/100, {
            from: {color: startColor},
            to: {color: endColor}
        });
        });
    }
}

}]);








