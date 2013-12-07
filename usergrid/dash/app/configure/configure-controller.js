'use strict';

AppServices.Controllers.controller('ConfigureCtrl',
  [ 'data',
    'performance',
    '$scope',
    '$rootScope',
    function (data, performance, $scope, $rootScope) {

      $scope.logLevels = [
        {value: 2, label: 'Verbose'},
        {value: 3, label: 'Debug'},
        {value: 4, label: 'Info'},
        {value: 5, label: 'Warn'},
        {value: 6, label: 'Error'},
        {value: 7, label: 'Assert'}
      ];

      $scope.updateLogLevel = function(logLevel,dataAttr){
        $scope.configData[dataAttr].logLevelToMonitor = logLevel.value;
      }

      $scope.deviceNumberFilters = '';
      $scope.deviceIdFilters = '';

      $scope.updateFilter = function(filter,filterAttr,filterType){
        var tempArray = filter.split('\n');
        $scope.configData[filterAttr] = [];
        for(var i=0; i < tempArray.length;i++){
          $scope.configData[filterAttr].push({filterValue:tempArray[i],filterType:filterType})
        }
      }

      $scope.defaultAppConfigParameters = [{tag:'',paramKey:'',paramValue:''}];
      $scope.deviceLevelConfigParameters  = [{tag:'',paramKey:'',paramValue:''}];
      $scope.abConfigParameters  = [{tag:'',paramKey:'',paramValue:''}];


      $scope.addRemoveConfig = function(config,configStore){

        var addNew = true;
        if(config.index === $scope[configStore].length){
          //validation
          if(config.paramValue === '' && config.tag === '' && config.paramKey === ''){
            //remove blank
            $scope[configStore].pop();
            addNew = false;
          }
          if(addNew || 0 === $scope[configStore].length){
            //add it
            $scope[configStore].push({tag:'',paramKey:'',paramValue:''})
          }
        }else{
          //remove existing
          angular.forEach($scope[configStore], function(value, key){
            if(value.tag === config.tag && value.paramKey === config.paramKey && value.paramValue === config.paramValue){
              $scope[configStore].splice([key],1);
            }
          });
        }

        if(configStore === 'defaultAppConfigParameters'){
          $scope.configData.defaultAppConfig.customConfigParameters = $scope[configStore];
        }else if(configStore === 'deviceLevelConfigParameters'){
          $scope.configData.deviceLevelAppConfig.customConfigParameters = $scope[configStore];
        }else if(configStore === 'abConfigParameters'){
          $scope.configData.abtestingAppConfig.customConfigParameters = $scope[configStore];
        }

      }


        $scope.deferredLogin.promise.then(function(){
          var configData = data.resource(
            {
              appname:$rootScope.currentApp,
              orgname:$rootScope.currentOrg,
              username:'apm',
              endpoint:'apigeeMobileConfig'
            },false).get({callback:'JSON_CALLBACK',access_token:localStorage.getItem('accessToken')},
            function (cdata) {

              $scope.configData = cdata;


              if(cdata.deviceNumberFilters && cdata.deviceNumberFilters.length > 0){
                angular.forEach(cdata.deviceNumberFilters, function(value, key){
                  $scope.deviceNumberFilters += value.filterValue + '\n';
                });
              }

              if(cdata.deviceIdFilters && cdata.deviceIdFilters.length > 0){
                angular.forEach(cdata.deviceIdFilters, function(value, key){
                  $scope.deviceIdFilters += value.filterValue + '\n';
                });
              }

              //default configs
              angular.forEach($scope.logLevels, function(value, key){
                if(cdata.defaultAppConfig.logLevelToMonitor === value.value){
                  $scope.appConfigLogLevel = $scope.logLevels[key]
                }
              });

              if(cdata.defaultAppConfig.customConfigParameters.length > 0){
                $scope.defaultAppConfigParameters = cdata.defaultAppConfig.customConfigParameters;
              }

              //beta configs
              angular.forEach($scope.logLevels, function(value, key){
                if(cdata.deviceLevelAppConfig.logLevelToMonitor === value.value){
                  $scope.betaLogLevel = $scope.logLevels[key]
                }
              });

              if(cdata.deviceLevelAppConfig.customConfigParameters.length > 0){
                $scope.deviceLevelConfigParameters = cdata.deviceLevelAppConfig.customConfigParameters;
              }


              //a/b configs
              angular.forEach($scope.logLevels, function(value, key){
                if(cdata.abtestingAppConfig.logLevelToMonitor === value.value){
                  $scope.abLogLevel = $scope.logLevels[key]
                }
              });

              if(cdata.abtestingAppConfig.customConfigParameters.length > 0){
                $scope.abConfigParameters = cdata.abtestingAppConfig.customConfigParameters;
              }

            },
            function (fail) {
              console.log('problem getting config data: ', fail);
            });

        });
        $scope.saveData = function(configStore){

          //check the array for a blank entry at the end
          var configStoreLength = $scope[configStore].length
          if(configStoreLength > 0){
            if($scope[configStore][(configStoreLength - 1)].tag === '' ||
              $scope[configStore][(configStoreLength - 1)].paramKey === '' ||
              $scope[configStore][(configStoreLength - 1)].paramValue === ''){
              $scope[configStore].pop();
            }
          }

          //remove the index property for UI needs only
          angular.forEach($scope[configStore], function(value, key){
            if(value.index){
              console.log(value)
              delete value.index;
              console.log(value)
            }
          });

          var payload;
          payload = {'apigeeMobileConfig':$scope.configData};

          data.resource(
            {
            orgname:$rootScope.currentOrg,
            appname:$rootScope.currentApp
          },false).save(
            {
              access_token:localStorage.getItem('accessToken')
            },
            payload);
        }





      }])
