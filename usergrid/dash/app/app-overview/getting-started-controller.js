'use strict'

AppServices.Controllers.controller('GettingStartedCtrl',
  ['ug',
    'data',
    'performance',
    '$scope',
    '$rootScope',
    '$location',
    '$timeout',
    '$anchorScroll', function (ug, data, performance, $scope, $rootScope, $location, $timeout,$anchorScroll) {


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

    $scope.setupSDKSetup = function(){

      $scope.clientID = '';
      $scope.clientSecret = '';
      var getKeys = function(){
        return data.jsonp_raw('credentials', '', {});
      }

      $scope.regenerateCredentialsDialog = function(modalId){
        $scope.orgAPICredentials = {client_id:'regenerating...',client_secret:'regenerating...'};
        ug.regenerateAppCredentials();
        $scope.hideModal(modalId);
      };


      $scope.$on('app-creds-updated', function(event, credentials) {
        $scope.clientID = credentials.client_id;
        $scope.clientSecret = credentials.client_secret;
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      });

      ug.getAppCredentials();

      $scope.$watch('currentApp',function(newval,oldval){
        if(newval !== oldval){
          ug.getAppCredentials();
          if(!$scope.$$phase) {
            $scope.$apply();
          }
          /*
           $scope.deferredLogin.promise.then(getKeys).then(function(keyData){
           $scope.clientID = keyData.credentials.client_id;
           $scope.clientSecret = keyData.credentials.client_secret;
           });
           */
        }
      })

      $scope.contentTitle;

      $scope.showSDKDetail = function(name){
        var introContainer = document.getElementById('intro-container');

        //if no value then let link click happen and reset height to remove content
        if(name==='nocontent' ){
          introContainer.style.height = '0';
          return true;
        }

        introContainer.style.opacity = .1;
        introContainer.style.height = '0';
        var timeout = 0;
        if($scope.contentTitle){
          timeout = 500;
        }
        $timeout(function(){introContainer.style.height = '1000px';introContainer.style.opacity = 1;},timeout);
        $scope.optionName = name;
        $scope.contentTitle = name;

        $scope.sdkLink = 'http://apigee.com/docs/content/' + name + '-sdk-redirect';
        $scope.docsLink = 'http://apigee.com/docs/app-services/content/installing-apigee-sdk-' + name;

        $scope.getIncludeURL = function(){
          return 'app-overview/doc-includes/' + $scope.optionName + '.html';
        }
//      $location.path('http://mktg-dev.apigee.com/docs/content/ios-sdk-redirect');
      }

    };

    $scope.scrollToElement=function(elem){
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash(elem);

      // call $anchorScroll()
      $anchorScroll();
    }
  }]);