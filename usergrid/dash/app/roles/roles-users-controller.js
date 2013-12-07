'use strict'

AppServices.Controllers.controller('RolesUsersCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.usersSelected = 'active';
    $scope.previous_display = 'none';
    $scope.next_display = 'none';
    $scope.user = {};
    $scope.master = '';

    //todo find others and combine this into one controller
    ug.getUsersTypeAhead();

    $scope.usersTypeaheadValues = [];
    $scope.$on('users-typeahead-received', function(event, users) {
      $scope.usersTypeaheadValues = users;
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.addRoleToUserDialog = function(modalId){
      if ($scope.user.uuid) {
        var roleName =  $rootScope.selectedRole._data.uuid;
        ug.addUserToRole($scope.user.uuid, roleName);
        $scope.hideModal(modalId)
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a user.');
      }
    };

    $scope.removeUsersFromGroupDialog = function(modalId){
      var roleName =  $rootScope.selectedRole._data.uuid;
      var users = $rootScope.rolesCollection.users._list;
      for (var i=0;i<users.length;i++) {
        if (users[i].checked) {
          ug.removeUserFromRole(users[i]._data.uuid, roleName);
        }
      }
      $scope.hideModal(modalId)
    };



    $scope.get = function() {
      var options = {
        type:'roles/'+$rootScope.selectedRole._data.name +'/users'
      }
      $rootScope.rolesCollection.addCollection('users', options, function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting users for role');
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
      if ($rootScope.rolesCollection.users.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }

      if($rootScope.rolesCollection.users.hasNextPage()) {
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
      $rootScope.rolesCollection.users.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page of users');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.getNext = function () {
      $rootScope.rolesCollection.users.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page of users');
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