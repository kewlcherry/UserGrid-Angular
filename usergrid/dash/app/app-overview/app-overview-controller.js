'use strict'

AppServices.Controllers.controller('AppOverviewCtrl',
   ['ug',
    'data',
    'performance',
    '$scope',
    '$rootScope',
    '$location',
    '$timeout', function (ug, data, performance, $scope, $rootScope, $location, $timeout) {


   if(!$rootScope.chartTemplate){
     //get the chart template for this view... right now it covers all charts...
     data.get(null, 'charts/highcharts.json').then(function (success) {
       $rootScope.chartTemplate = success;
     }, function (fail) {
       console.log('Problem getting chart template', fail)
     });
   }


  $scope.collections = [];
  $scope.graph = '';

  $scope.summarySetup = function(){

    ug.getTopCollections();

    $scope.$watch('currentApp',function(newval,oldval){
      if(newval !== oldval){
        ug.getTopCollections();
        //todo - find out why we need to force the view here. It's coming from the dfk service layer
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      }

    })


    function keys(o) {
      var a = [];
      for (var propertyName in o) {
        a.push(propertyName);
      }
      return a;
    }

    $scope.$on('top-collections-received', function(event, collections) {

      var dataDescription = {
        bar1: {
          labels: ['Total'],
          dataAttr: ['title', 'count'],
          colors: [createGradient('rgba(36,151,212,0.6)', 'rgba(119,198,240,0.6)')],
          borderColor: '#1b97d1'
        }
      };

      //todo add this to performance service as helper
      $scope.collections = collections;
      var arr =[];
      for( var i in collections ) {
        if (collections.hasOwnProperty(i)){
          arr.push(collections[i]);
        }
      }

      $scope.appOverview = {};
      $scope.appOverview.chart = angular.copy($rootScope.chartTemplate.pareto);
      $scope.appOverview.chart = performance.convertParetoChart(arr, $scope.appOverview.chart, dataDescription.bar1, '1h', 'NOW');


      //todo - find out why we need to force the view here. It's coming from the dfk service layer
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }

    });

  }



}]);