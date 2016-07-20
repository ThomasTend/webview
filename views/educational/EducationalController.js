var myApp=angular.module('MUHCApp');
myApp.controller('EducationalController',['$scope','EducationalMaterial','$timeout','$sce',function($scope,EducationalMaterial,$timeout,$sce) {

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

  $scope.notBooklet = true;

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

  $scope.tableOfContents = false;

  var sections = {};

  $scope.generateURL = function(material) {

    var url = material.Url;

    if((url.indexOf("pdf") > -1) && (url.indexOf("youtube") == -1)) { // the material is a pdf
      $scope.tableOfContents = false;
      $scope.notBooklet = true;
      // display the pdf
      return $sce.trustAsResourceUrl(url);
    } else if((url.indexOf("php") > -1) && (url.indexOf("youtube") == -1)) { // the material is a php factsheet
      $scope.tableOfContents = false;
      $scope.notBooklet = true;
      // display the factsheet
      return $sce.trustAsResourceUrl(url);
    } else if(url.indexOf("youtube") > -1) { // the material is a youtube video
      $scope.tableOfContents = false;
      $scope.notBooklet = true;
      // display the video
      return $sce.trustAsResourceUrl(url);
    } else if(url === "") { // the material is a booklet
      // use the TableContents array to make a menu of the php sections to display
      $scope.notBooklet = false;
      var tableOfContentsArray = material.TableContents;
      $scope.listTableContents = tableOfContentsArray;
      $scope.selectedSection = tableOfContentsArray[0];
      $scope.tableOfContents = true;
      sections = tableOfContentsArray;
    }

  };

  $scope.selectSection = function(section) {
    console.log("dfsdgsdgsdg" + typeof(section));
    for(var i = 0; i < sections.length; i++) {
      if(sections[i].Name_EN === section) {
        console.log("sections at i");
        console.log(sections[i]);
        $timeout(function() {
          $scope.selectedSection = sections[i];
        });
        break;
      }
    }
    console.log(section);
    console.log($scope.selectedSection);
  };

  $scope.generateURLForBookletSections = function(section) {
    console.log(section);
    return $sce.trustAsResourceUrl(section.URL_EN);
  };

  $scope.selectMaterial = function(material) {
    $timeout(function() {
      $scope.selectedMaterial = material;
    }); 
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
