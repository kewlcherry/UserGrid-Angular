'use strict'

AppServices.Controllers.controller('GroupsRolesCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.rolesSelected = 'active';
    $scope.roles_previous_display = 'none';
    $scope.roles_next_display = 'none';
    $scope.name = '';
    $scope.master = '';

    ug.getRolesTypeAhead();

    $scope.addGroupToRoleDialog = function(modalId){
      if ($scope.name) {
        var path =  $rootScope.selectedGroup.get('path');
        ug.addGroupToRole(path, $scope.name);
        $scope.hideModal(modalId)
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a role name.');
      }
    };


    $scope.leaveRoleDialog = function(modalId){
      var path =  $rootScope.selectedGroup.get('path');
      var roles = $rootScope.groupsCollection.roles._list;
      for (var i=0;i<roles.length;i++) {
        if (roles[i].checked) {
          ug.removeUserFromGroup(path, roles[i]._data.name);
        }
      }
      $scope.hideModal(modalId)
    };

    $scope.addGroupPermissionDialog = function(modalId){
      if ($scope.path) {
        var permission = $scope.createPermission(null,null,$scope.path,$scope.permissions);
        var path =  $rootScope.selectedGroup.get('path');
        ug.newGroupPermission(permission, path);
        $scope.hideModal(modalId)
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a name for the permission.');
      }
    };

    $scope.deleteGroupPermissionDialog = function(modalId){
      var path =  $rootScope.selectedGroup.get('path');
      var permissions = $rootScope.selectedGroup.permissions;
      for (var i=0;i<permissions.length;i++) {
        if (permissions[i].checked) {
          ug.deleteGroupPermission(permissions[i].perm, path);
        }
      }
      $scope.hideModal(modalId)
    };

    $scope.resetNextPrev = function() {
      $scope.roles_previous_display = 'none';
      $scope.roles_next_display = 'none';
      $scope.permissions_previous_display = 'none';
      $scope.permissions_next_display = 'none';
    }
    $scope.checkNextPrevRoles = function() {
      $scope.resetNextPrev();
      if ($scope.groupsCollection.roles.hasPreviousPage()) {
        $scope.roles_previous_display = 'block';
      }
      if($scope.groupsCollection.roles.hasNextPage()) {
        $scope.roles_next_display = 'block';
      }
    }
    $scope.checkNextPrevPermissions = function() {
      if ($scope.groupsCollection.permissions.hasPreviousPage()) {
        $scope.permissions_previous_display = 'block';
      }
      if($scope.groupsCollection.permissions.hasNextPage()) {
        $scope.permissions_next_display = 'block';
      }
    }

    $scope.getRoles = function() {

      var path = $rootScope.selectedGroup.get('path');
      var options = {
        type:'groups/'+ path +'/roles'
      }
      $rootScope.groupsCollection.addCollection('roles', options, function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting roles for group');
        } else {
          $scope.checkNextPrevRoles();
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }
      });
    }

    $scope.getPermissions = function() {

      $rootScope.selectedGroup.permissions = [];
      $rootScope.selectedGroup.getPermissions(function(err, data){
        if (err) {

        } else {
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

      });

/*
      var options = {
        type:'groups/'+$rootScope.selectedGroup.path +'/permissions'
      }
      $rootScope.groupsCollection.addCollection('permissions', options, function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting permissions for group');
        } else {
          $scope.checkNextPrevPermissions();
 if(!$rootScope.$$phase) {
 $rootScope.$apply();
 }
        }
      });
      */
    }

    $scope.getPreviousRoles = function () {
      $rootScope.groupsCollection.roles.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page of roles');
        }
        $scope.checkNextPrevRoles();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };
    $scope.getNextRoles = function () {
      $rootScope.groupsCollection.roles.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page of roles');
        }
        $scope.checkNextPrevRoles();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };
    $scope.getPreviousPermissions = function () {
      $rootScope.groupsCollection.permissions.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page of permissions');
        }
        $scope.checkNextPrevPermissions();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };
    $scope.getNextPermissions = function () {
      $rootScope.groupsCollection.permissions.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page of permissions');
        }
        $scope.checkNextPrevPermissions();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.$on('role-update-received', function(event) {
      $scope.getRoles();
    });
    $scope.$on('permission-update-received', function(event) {
      $scope.getPermissions();
    });


    if (!$rootScope.selectedGroup) {
      $location.path('/groups');
      return;
    } else {
      $scope.getRoles();
      $scope.getPermissions();
    }

  }]);