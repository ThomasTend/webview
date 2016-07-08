
myApp.controller('AccountController',['$scope','UserPreferences','Patient','ngMaterial', 'ngMessages', 'material.svgAssetsCache',function($scope,UserPreferences,Patient,ngMaterial, ngMessages) {
  /*
  $scope.editingDiv = {
      //editFirstNameDiv: false,
      //editLastNameDiv: false,
      editEmailDiv: false,
      editTelNumDiv: false,
      editLanDiv: false,
      editPasswordDiv: false,
      editSMSDiv:false

  };

  $scope.hideSectionsBut = function (onlyDivToShow) {
        for (var div in $scope.editingDiv) {
            if (div !== onlyDivToShow) {
                //console.log($scope.editingDiv[div]);
                $scope.editingDiv[div] = false;

            }

        }
    };
    */
    $scope.checkboxModel=UserPreferences.getEnableSMS();
    $scope.FirstName = Patient.getFirstName();
    $scope.LastName = Patient.getLastName();
    $scope.Email = Patient.getEmail();
    $scope.TelNum = Patient.getTelNum();
    $scope.Language=UserPreferences.getLanguage();
    $scope.sms=UserPreferences.getEnableSMS();

    if((window.localStorage.getItem('pass')).length>7){
        $scope.passwordLength=7;
    }else{
        $scope.passwordLength=window.localStorage.getItem('pass').length;
    }
    
}]);

myApp.controller('SelectOptGroupController', function($scope) {
      console.log("Here 1");

      $scope.editingDiv = {
          Email: false,
          Telephone: false,
          Language: false,
          password: false,
          SMS:false
      };
      /*
      $scope.SMSPreferences = [
        "Enable",
        "Disable"
      ];*/

      $scope.options = [
          "Email",
          "password",
          "SMS",
          "Telephone",
          "Language"
      ];
      
      console.log("Here 2");
      $scope.goOptionSelected = function(onlyDivToShow) {
        console.log("Here 3");
        console.log(onlyDivToShow + " " + $scope.editingDiv[onlyDivToShow] + " asdasdasdas");
          $scope.editingDiv[onlyDivToShow] = true;
          $scope.optionSelected = onlyDivToShow;
    
          for (var option in $scope.editingDiv) {
            if (option !== onlyDivToShow) {
                $scope.editingDiv[option] = false;
            }
            console.log(option + " " + $scope.editingDiv[option] + " klfnklsnfklsdfklsdkfsk");
          }
      }

    });