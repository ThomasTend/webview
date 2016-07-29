myApp.controller('AccountController',['$scope','UserPreferences','Patient',function($scope,UserPreferences,Patient) {
    $scope.checkboxModel=UserPreferences.getEnableSMS();
    $scope.FirstName = Patient.getFirstName();
    $scope.LastName = Patient.getLastName();
    $scope.Email = Patient.getEmail();
    $scope.TelNum = Patient.getTelNum();
    $scope.Language=UserPreferences.getLanguage();
    $scope.sms=UserPreferences.getEnableSMS();

}]);

myApp.controller('SelectOptGroupController', function($scope) {
     
      $scope.editingDiv = {
          Email: false,
          Telephone: false,
          Language: false,
          password: false,
          SMS:false
      };

      $scope.options = [
          "Email",
          "password",
          "SMS",
          "Telephone",
          "Language"
      ];
      
      $scope.goOptionSelected = function(onlyDivToShow) {
          $scope.editingDiv[onlyDivToShow] = true;
          $scope.optionSelected = onlyDivToShow;
    
          for (var option in $scope.editingDiv) {
            if (option !== onlyDivToShow) {
                $scope.editingDiv[option] = false;
            }
          }
      }

    });
    