'use strict'

AppServices.Controllers.controller('RolesGroupsCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.groupsSelected = 'active';
    $scope.previous_display = 'none';
    $scope.next_display = 'none';
    $scope.path = '';
    $scope.master = '';


    ug.getGroupsTypeAhead();

    $scope.groupsTypeaheadValues = [];
    $scope.$on('groups-typeahead-received', function(event, groups) {
      $scope.groupsTypeaheadValues = groups;
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.addRoleToGroupDialog = function(modalId){
      if ($scope.path) {
        var name =  $rootScope.selectedRole._data.uuid;
        ug.addGroupToRole($scope.path, name);
        $scope.hideModal(modalId);
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a group.');
      }
    };

    $scope.removeGroupFromRoleDialog = function(modalId){
      console.log('---',$rootScope.selectedRole._data.uuid)
      var roleName =  $rootScope.selectedRole._data.uuid;
      var groups = $rootScope.rolesCollection.groups._list;
      for (var i=0;i<groups.length;i++) {
        if (groups[i].checked) {
          ug.removeUserFromGroup(groups[i]._data.path, roleName);
        }
      }
      $scope.hideModal(modalId);
    };

    $scope.get = function() {
      var options = {
        type:'roles/'+$rootScope.selectedRole._data.name +'/groups',
        qs:{ql:'order by title'}
      }
      $rootScope.rolesCollection.addCollection('groups', options, function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting groups for role');
        } else {
          $scope.checkNextPrev();
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }
      });
    }

    $scope.resetNextPrev = function() {
      $scope.previous_display = 'none';
      $scope.next_display = 'none';
    }
    $scope.checkNextPrev = function() {
      $scope.resetNextPrev();
      if ($scope.rolesCollection.groups.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }

      if($scope.rolesCollection.groups.hasNextPage()) {
        $scope.next_display = 'block';
      }
    }

    if (!$rootScope.selectedRole) {
      $location.path('/roles');
      return;
    } else {
      $scope.get();
    }

    $scope.getPrevious = function () {
      $rootScope.rolesCollection.groups.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page of groups');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.getNext = function () {

      $rootScope.rolesCollection.groups.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page of groups');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.$on('role-update-received', function(event) {
      $scope.get();
    });

}]);