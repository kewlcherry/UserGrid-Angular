'use strict'

AppServices.Controllers.controller('UsersGroupsCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $rootScope.groupsCollection = {};
    $rootScope.groups_previous_display = 'none';
    $rootScope.groups_next_display = 'none';
    $scope.groups_check_all = '';
    $scope.groupsSelected = 'active';
    $scope.name = '';
    $scope.master = '';

    //---------modals
    $scope.addUserToGroupDialog = function(modalId){
      if ($scope.name) {
        var username =  $rootScope.selectedUser.get('uuid');
        ug.addUserToGroup(username, $scope.name);
        $scope.hideModal(modalId);
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a group.');
      }
    }

    $scope.leaveGroupDialog = function(modalId){
      $scope.deleteEntities($rootScope.groupsCollection, 'user-left-group', 'error removing user from group');
      $scope.hideModal(modalId);
    }

    if (!$rootScope.selectedUser) {
      $location.path('/users');
      return;
    } else {
      ug.getGroupsForUser($rootScope.selectedUser.get('uuid'));
    }

    ug.getGroupsTypeAhead();

//    $scope.groupsTypeaheadValues = [];



    $scope.$on('user-groups-received', function(event, groups) {
      $rootScope.groupsCollection = groups;
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
      if ($rootScope.groupsCollection.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }

      if($rootScope.groupsCollection.hasNextPage()) {
        $scope.next_display = 'block';
      }
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

    $scope.$on('user-left-group', function(event) {
      $scope.master = false;
    });

    $scope.$on('user-added-to-group-received', function(event) {
      $scope.checkNextPrev();
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });

  }]);