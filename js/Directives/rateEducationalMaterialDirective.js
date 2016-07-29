/**
 * @name rate-material
 * @description 5 star rating system for educational material and app rating
 * 
 * 
 */
angular.module('MUHCApp')
.directive('rateMaterial', function(Patient, RequestToServer) {
  return {
    restrict: 'E', // E for "element", i.e. an html tag
    transclude: true, // allow transclusion, i.e. html in between the open and close rateMAterial tag
    scope: {
        eduMaterialControlSerNum: '=serNum' // pass the edu material ser-num as argument or -1 to rate the app
    },
    templateUrl: './views/educational/rating-education-template-directive.html',
    link: function (scope, element) {

    initRater();
    
    function initRater() // initialize the stars
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
    scope.rateMaterial = function(index) // change the css of the selected stars ()fill them to indicate the rating
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
    scope.submit = function() // called by ng-click on the submit button
    {
        console.log("IN SUBMIT RATING");
        var patientSerNum = Patient.getUserSerNum(); // get the patient ser-num
        var edumaterialControlSerNum = scope.eduMaterialControlSerNum; // get the argument's value
        console.log("edumaterialControlSerNum is " + edumaterialControlSerNum);
        if(edumaterialControlSerNum > -1) { // I set the ser-num to -1 to specify that we want to rate the app
            console.log("Hence, rate material");
            RequestToServer.sendRequest('QuestionnaireRating',{'PatientSerNum':patientSerNum,'EducationalMaterialControlSerNum':edumaterialControlSerNum,'RatingValue':scope.ratingValue});
            scope.submitted = true;
        } else { // any other ser-num is to rate an educational material
            console.log("Hence, rate app");
            RequestToServer.sendRequest('Feedback',{'PatientSerNum':patientSerNum,'RatingValue':scope.ratingValue});
            scope.submitted = true;
            }
        scope.submitted = true;
    }
      
    }
  };
});