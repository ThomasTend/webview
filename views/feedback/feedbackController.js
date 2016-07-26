var myApp=angular.module('MUHCApp');
myApp.controller('feedbackController',['$scope','Patient',function($scope,Patient) {
    $scope.patient=Patient.getPatientFields();
}]);