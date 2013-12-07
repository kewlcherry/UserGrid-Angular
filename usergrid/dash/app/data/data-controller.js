'use strict'

AppServices.Controllers.controller('DataCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.verb = 'GET';
    $scope.display = '';
    $scope.queryPath = '';
    $scope.queryBody = '{ "name":"value" }';
    $scope.queryBodyDetail = {};
    $scope.searchString = '';
    $scope.queryLimit = '';
    $scope.queryBodyDisplay = 'none';
    $scope.queryLimitDisplay = 'block';
    $scope.queryStringDisplay = 'block';
    $scope.entitySelected = {};
    $scope.newCollectionName = '';

    $scope.setDisplayType = function() {
      $scope.display = 'generic';

      /*
       if (collection._type == 'users') {
       $scope.display = 'users';
       }
       */
    }


    $scope.newCollectionDialog = function(modalId){
      console.log($scope.newCollectionName)
      if ($scope.newCollectionName) {
        ug.createCollection($scope.newCollectionName);
        ug.getTopCollections();
        $rootScope.$broadcast('alert', 'success', 'Collection created successfully.');
        $scope.hideModal(modalId)
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a collection name.');
      }
    };

    $scope.addToPath = function(uuid){
      $scope.queryPath = '/' + $rootScope.queryCollection._type + '/' + uuid;
    }

    $scope.isDeep = function(item){
      //can be better, just see if object for now
      return (Object.prototype.toString.call(item) === "[object Object]");
    };

    //persistent vars (stay around when you drill down to an entity detail view)
    $rootScope.queryCollection = $rootScope.queryCollection  || {};
    $rootScope.selectedEntity = {};
    if ($rootScope.queryCollection) {
      $scope.queryPath = $rootScope.queryCollection._type;
      $scope.setDisplayType();
    }

    //get collection list
    $scope.loadCollection = function(type) {
      $scope.queryPath = type;
      $scope.searchString = '';
      $scope.queryLimit = '';
      $scope.body = '{ "name":"value" }';
      $scope.selectGET();
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
      $scope.run();
    }

    ug.getTopCollections();
    $scope.$watch('currentApp',function(){
      ug.getTopCollections();
    });

    $scope.$on('top-collections-received', function(event, collectionList) {
      var ignoredCollections = ['events'];
      //remove some elements from the collection
      ignoredCollections.forEach(function(ignoredCollection){
         collectionList.hasOwnProperty(ignoredCollection)  //important check that this is objects own property, not from prototype prop inherited
          && delete collectionList[ignoredCollection]
         ;
      });
      $scope.collectionList = collectionList;
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });

    $scope.selectGET = function() {
      $scope.queryBodyDisplay = 'none';
      $scope.queryLimitDisplay = 'block';
      $scope.queryStringDisplay = 'block';
      $scope.verb = 'GET';
    }
    $scope.selectPOST = function() {
      $scope.queryBodyDisplay = 'block';
      $scope.queryLimitDisplay = 'none';
      $scope.queryStringDisplay = 'none';
      $scope.verb = 'POST';
    }
    $scope.selectPUT = function() {
      $scope.queryBodyDisplay = 'block';
      $scope.queryLimitDisplay = 'block';
      $scope.queryStringDisplay = 'block';
      $scope.verb = 'PUT';
    }
    $scope.selectDELETE = function() {
      $scope.queryBodyDisplay = 'none';
      $scope.queryLimitDisplay = 'block';
      $scope.queryStringDisplay = 'block';
      $scope.verb = 'DELETE';
    }

    $scope.validateJson = function() {
      var queryBody = $scope.queryBody;

      try {
        queryBody = JSON.parse(queryBody);
      } catch (e) {
        $rootScope.$broadcast('alert', 'error', 'JSON is not valid');
        return false;
      }

      queryBody = JSON.stringify(queryBody,null,2);

      $rootScope.$broadcast('alert','success', 'JSON is valid');

      $scope.queryBody = queryBody;
      return true;
    }


    $scope.saveEntity = function(entity){
      if (!$scope.validateJson()) {
        return false;
      }
      var queryBody = entity._json;
      queryBody = JSON.parse(queryBody);
      $rootScope.selectedEntity.set(); //clears out all entities
      $rootScope.selectedEntity.set(queryBody);
      $rootScope.selectedEntity.set('type', entity._data.type);
      $rootScope.selectedEntity.set('uuid', entity._data.uuid);
      $rootScope.selectedEntity.save(function(err, data){
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error: ' + data.error_description);
        } else {
          $rootScope.$broadcast('alert', 'success', 'entity saved');
        }

      });
    }

    $scope.run = function() {
      //clear the current data
      $rootScope.queryCollection = '';

      //get the parameters
      var queryPath = $scope.queryPath || '';
      queryPath = queryPath.replace('/', '');
      var searchString = $scope.searchString || '';
      var queryLimit = $scope.queryLimit || '';
      var body = JSON.parse($scope.queryBody || '{}');

      if ($scope.verb == 'POST' && $scope.validateJson()) {
        ug.runDataPOSTQuery(queryPath, body);
      } else if ($scope.verb == 'PUT' && $scope.validateJson()) {
        ug.runDataPutQuery(queryPath, searchString, queryLimit, body);
      } else if ($scope.verb == 'DELETE') {
        ug.runDataDeleteQuery(queryPath, searchString, queryLimit);
      } else {
        //GET
        ug.runDataQuery(queryPath, searchString, queryLimit);
      }
    }

    $scope.$on('error-running-query', function(event) {
      $rootScope.$broadcast('alert','success', 'Entities deleted sucessfully');
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });


    $scope.$on('entity-deleted', function(event) {
      $rootScope.$broadcast('alert','success', 'Entities deleted sucessfully');
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });

    $scope.$on('query-received', function(event, collection) {
      $rootScope.queryCollection = collection;
      ug.getIndexes($scope.queryPath);
      console.log($rootScope.queryCollection)
      $rootScope.$broadcast('alert','success', 'API call completed sucessfully');

      $scope.setDisplayType();

      $scope.checkNextPrev();
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });

    $scope.$on('indexes-received', function(event, indexes) {
      //todo - do something with the indexes
      var fred = indexes;
    });



    $scope.hasProperty = function(prop){
      //checks each object in array for a given property - used for hiding/showing UI data in table
      var retval = false;
      if(typeof $rootScope.queryCollection._list !== 'undefined'){
        angular.forEach($rootScope.queryCollection._list, function(value, key){
          //no way to break angular loop :(
          if(!retval){
            if(value._data[prop]){
              retval = true;
            }
          }
        });
      }
      return retval;
    }



    $scope.resetNextPrev = function() {
      $scope.previous_display = 'none';
      $scope.next_display = 'none';
    }
    $scope.checkNextPrev = function() {
      $scope.resetNextPrev();
      if ($rootScope.queryCollection.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }
      if($rootScope.queryCollection.hasNextPage()) {
        $scope.next_display = 'block';
      }
    }

    $scope.selectEntity = function(uuid){
      $rootScope.selectedEntity = $rootScope.queryCollection.getEntityByUUID(uuid);
      $scope.addToPath(uuid);
    }

    $scope.getJSONView = function(entity){
      var tempjson  = entity.get();

      //rip out the system elements.  Stringify first because we don't want to rip them out of the actual object
      var queryBody = JSON.stringify(tempjson, null, 2);
      queryBody = JSON.parse(queryBody);
      delete queryBody.metadata;
      delete queryBody.uuid;
      delete queryBody.created;
      delete queryBody.modified;
      delete queryBody.type;

      $scope.queryBody = JSON.stringify(queryBody, null, 2);
    }

    $scope.getPrevious = function () {
      $rootScope.queryCollection.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page of data');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.getNext = function () {
      $rootScope.queryCollection.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page of data');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };


//    $scope.selectEntity = function(uuid){
//      $rootScope.selectedEntity = $rootScope.queryCollection.getEntityByUUID(uuid);
//      $location.path('/data/entity');
//    }




  }]);