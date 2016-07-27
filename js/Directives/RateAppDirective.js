/**
 * @name rate-app
 * @description This directive is in charge of the rating of the app
 * 
 * 
 */

angular.module('MUHCApp')
.directive('rateMaterial', function(Patient, RequestToServer) {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: './views/app-rating-template-directive.html',
    link: function (scope, element) {

    initRater();
    
    function initRater()
    {
        scope.rate = [];
        scope.submitted = false;
        scope.emptyRating = true;
        for(var i = 0; i < 5;i++)
        {
            scope.rate.push({
                'Icon':'ion-ios-star-outline'
            });
        }
    }
    scope.rateApp = function(index)
    {
        scope.emptyRating = false;
        scope.ratingValue = index+1;
        for(var i = 0; i < index+1;i++)
        {
            scope.rate[i].Icon = 'ion-star';
        }
        for(var i = index+1; i < 5;i++)
        {
            scope.rate[i].Icon = 'ion-ios-star-outline';
        }
    };
    scope.submit = function()
    {
        var patientSerNum = Patient.getUserSerNum();
        RequestToServer.sendRequest('Feedback',{'PatientSerNum':patientSerNum, 'RatingValue':scope.ratingValue});
        scope.submitted = true;
    }
      
    }
  };
});