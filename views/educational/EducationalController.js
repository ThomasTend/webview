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
  console.log("Test outside all functions");
  var counter = 0;
  console.log("value of counter is " + counter);

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
      console.log("in generateURL " + material.Name_EN);
      console.log("generateURL value of counter is " + counter);
      if(counter == 0) {
      $scope.selectedSection = tableOfContentsArray[0];
      }
      $scope.tableOfContents = true;
      sections = tableOfContentsArray;
    }

  };



  $scope.selectSection = function(section) {
    console.log("In selectSection");
    console.log("dfsdgsdgsdg " + typeof(section));
    for(var i = 0; i < sections.length; i++) {
      if(sections[i].Name_EN === section) {
        console.log("sections at i");
        console.log(sections[i]);
        $scope.selectedSection = sections[i];
        break;
      }
    }
    console.log("selectSection B value of counter is " + counter);
    if(section === sections[0].Name_EN) {
      counter = 0;
    } else {
      counter = 1;
    }
    console.log("selectSection A value of counter is " + counter);
    console.log(section);
    console.log($scope.selectedSection);
  };

  $scope.generateURLForBookletSections = function(section) {
    console.log("In generateURLForBookletSections");
    console.log(section);
    console.log(typeof(section));
    return $sce.trustAsResourceUrl(section.URL_EN);
  };

  $scope.selectMaterial = function(material) {
    $timeout(function() {
      $scope.selectedMaterial = material;
    }); 
  };
  
}]);
