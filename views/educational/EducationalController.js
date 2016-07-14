var myApp=angular.module('MUHCApp');
myApp.controller('EducationalController',['$scope','EducationalMaterial','$timeout','$sce',function($scope,EducationalMaterial,$timeout,$sce){

  var materials = EducationalMaterial.getEducationalMaterial();

  var materialsBefore = [];
  var materialsDuring = [];
  var materialsAfter = [];

  for(var i = 0; i < materials.length; i++) {
    if(materials[i].PhaseInTreatment == "Prior To Treatment") {
        materialsBefore.push(materials[i]);
    } else if(materials[i].PhaseInTreatment == "During Treatment") {
        materialsDuring.push(materials[i]);
    } else if(materials[i].PhaseInTreatment == "After Treatment") {
        materialsAfter.push(materials[i]);
    }
  }

  $scope.materialsBefore = materialsBefore;
  $scope.materialsDuring = materialsDuring;
  $scope.materialsAfter = materialsAfter;

  console.log("materialsBefore");
  console.log(materialsBefore);

  console.log("materialsDuring");
  console.log(materialsDuring);

  console.log("materialsAfter");
  console.log(materialsAfter);


  $scope.selectedMaterial = materialsBefore[0];
  console.log(materials);

  var copyBtn = document.querySelector('.copy');

  copyBtn.addEventListener('click', function(event) {
  var textToCopy = document.querySelector('.toCopy');
  textToCopy.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }
  });

  $scope.generateURL = function (material) {
    
    if(material.Type == 'Factsheet')
    {
      return material.source;
    }else{
      return $sce.trustAsResourceUrl('https://www.youtube.com/embed/2dPfuxb1H8E');
    }
  };

  $scope.selectMaterial=function(material)
  {
    $timeout(function(){
      $scope.selectedMaterial=material;
    })
  };

  /*

  $scope.notToggle = function(toggle) {
      if(toggle == false) {
        $scope.toggle = true;
      } else {
        $scope.toggle = false;
      }
  };

  */

  /*
  $scope.shareOnFacebook = function(type,material)
  {
    window.open("https://www.facebook.com/sharer/sharer.php?u="+material.ShareURL,'_blank');
    facebookShareButtonClass = 'Active';
    ShareButtonClass[type] = 'Active';
    ShareButtonClass['Twitter'] = '';

  }

  var shareButtonClasses = ['microsoft', 'google', 'yahoo'];

  $scope.shareMicrosoft = function(material, type) {
    windows.open("" + material.ShareURL, '_blank', false);
    for(var i = 0; i < shareButtonClasses.length; i++) {
      (shareButtonClasses[i] == material) ? shareButtonClasses[]
    }
  }
  */
}]);
