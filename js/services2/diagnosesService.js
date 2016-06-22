var myApp=angular.module('MUHCApp');
myApp.service('Diagnoses',function($filter){
    var diagnoses=[];
    function searchAndDeleteDiagnoses(diag)
    {
      for (var i = 0; i < diag.length; i++) {
        for (var j = 0; j < diagnoses.length; j++) {
          if(diag[i].DiagnosisSerNum == diagnoses[j].DiagnosisSerNum)
          {
            diagnoses.splice(j, 1);
          }
        }
      }
    }

    function addDiagnosis(diag)
    {
      if(typeof diag=='undefined') return ;
      var temp=angular.copy(diag);
      for (var i = 0; i < diag.length; i++) {
        console.log(diag[i].CreationDate);
        diag[i].CreationDate=$filter('formatDate')(diag[i].CreationDate);
        diagnoses.push(diag[i]);
      }
      diagnoses=$filter('orderBy')(diagnoses, 'CreationDate');
      console.log(diagnoses);
    }
    return{
      setDiagnoses:function(diag)
      {
        diagnoses=[];
        addDiagnosis(diag)
      },
      updateDiagnoses:function(diag)
      {
        searchAndDeleteDiagnoses(diag);
        addDiagnosis(diag)
      },
      getDiagnoses:function()
      {
        return diagnoses;
      }
    }



  });
