'use strict'

AppServices.Controllers.controller('GroupsCtrl', ['ug', '$scope', '$rootScope', '$location', '$route',
  function (ug, $scope, $rootScope, $location, $route) {

    $rootScope.groupsCollection = {};
    $rootScope.selectedGroup = {};
    $scope.previous_display = 'none';
    $scope.next_display = 'none';

    ug.getGroups();

    $scope.currentGroupsPage = {};
//  $scope.$route = $route;

    $scope.selectGroupPage = function(route){
      //lokup the template URL with the route. trying to preserve routes in the markup and not hard link to .html
      $scope.currentGroupsPage.template = $route.routes[route].templateUrl;
      $scope.currentGroupsPage.route = route;
    }

    $scope.newGroupDialog = function(modalId){
      //todo: put more validate here
      if ($scope.path && $scope.title) {
        ug.createGroup($scope.path, $scope.title);
//        $rootScope.dialogBox.close();
        $rootScope.$broadcast('alert', 'success', 'Group created successfully.');
        $scope.hideModal(modalId)
      } else {
        $rootScope.$broadcast('alert', 'error', 'Missing required information.');
      }
    };

    $scope.deleteGroupsDialog = function(modalId){
      $scope.deleteEntities($rootScope.groupsCollection, 'group-deleted', 'error deleting group');
      $rootScope.$broadcast('alert', 'success', 'Group deleted successfully.');
      $scope.hideModal(modalId);
    };

    $scope.$on('groups-received', function(event, groups) {
      $rootScope.groupsCollection = groups;

      if(groups._list.length > 0){
        $scope.selectGroup(groups._list[0]._data.uuid)
      }

      $scope.checkNextPrev();
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });

    $scope.resetNextPrev = function() {
      $scope.previous_display = 'none';
      $scope.next_display = 'none';
    }
    $scope.checkNextPrev = function() {
      $scope.resetNextPrev();
      if ($scope.groupsCollection.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }
      if($scope.groupsCollection.hasNextPage()) {
        $scope.next_display = 'block';
      }
    }

    $scope.selectGroup = function(uuid){
      $rootScope.selectedGroup = $rootScope.groupsCollection.getEntityByUUID(uuid);
      $scope.currentGroupsPage.template = 'groups/groups-details.html';
      $scope.currentGroupsPage.route = '/groups/details';
    }

    $rootScope.getPrevious = function () {
      $rootScope.groupsCollection.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page of groups');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $rootScope.getNext = function () {

      $rootScope.groupsCollection.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page of groups');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.$on('group-deleted', function(event) {
      $scope.master = '';
    });


  }]);