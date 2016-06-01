/*
var myApp=angular.module('MUHCApp');
myApp.controller('MapsController',['Maps','$scope','$timeout',function(Maps,$scope,$timeout){

$scope.maps=Maps.getMaps();
$scope.selectedMap=$scope.maps[0];
$scope.showMap=function(map)
{
  $scope.selectedMap=map;
}

}])
*/

var myApp=angular.module('MUHCApp');
myApp.controller('ContactsController', ['$scope','Doctors', '$timeout','UpdateUI', function($scope,Doctors,$timeout,UpdateUI) {
    $scope.oncologists=Doctors.getOncologists();
    $scope.primaryPhysician=Doctors.getPrimaryPhysician();
    $scope.otherDoctors=Doctors.getOtherDoctors();
    $scope.dateToday=new Date();
    $scope.goDoctorContact=function(doctor) {
      $timeout(function(){
        $scope.doctorSelected=doctor;
      });

    };
    $scope.itemArray = Doctors.getContacts();
    $scope.doctorSelected=$scope.oncologists[0];

}]);