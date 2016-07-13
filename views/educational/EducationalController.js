var myApp=angular.module('MUHCApp');
myApp.controller('EducationalController',['$scope','EducationalMaterial','$timeout','$sce',function($scope,EducationalMaterial,$timeout,$sce){
  $scope.materials=EducationalMaterial.getEducationalMaterial();
  $scope.selectedMaterial = $scope.materials[0];
  console.log($scope.materials);
  $scope.generateURL = function (material) {

    if(material.sourceType=='PDF')
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
 
  }
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
