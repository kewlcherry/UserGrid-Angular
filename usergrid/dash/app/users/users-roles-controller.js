'use strict'

AppServices.Controllers.controller('UsersRolesCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.rolesSelected = 'active';
    $scope.name = '';
    $scope.master = '';

    ug.getRolesTypeAhead();


    $scope.addUserToRoleDialog = function(modalId){
      if ($scope.name) {
        var username =  $rootScope.selectedUser.get('uuid');
        ug.addUserToRole(username, $scope.name);
        $scope.hideModal(modalId);
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a role.');
      }
    };

    $scope.leaveRoleDialog = function(modalId){
      var username =  $rootScope.selectedUser.get('uuid');
      var roles = $rootScope.selectedUser.roles;
      for (var i=0;i<roles.length;i++) {
        if (roles[i].checked) {
          ug.removeUserFromRole(username, roles[i].name);
        }
      }
      $scope.hideModal(modalId);
    };

    $scope.deletePermissionDialog = function(modalId){
      var username =  $rootScope.selectedUser.get('uuid');
      var permissions = $rootScope.selectedUser.permissions;
      for (var i=0;i<permissions.length;i++) {
        if (permissions[i].checked) {
          ug.deleteUserPermission(permissions[i].perm, username);
        }
      }
      $scope.hideModal(modalId);
    };


    $scope.addUserPermissionDialog = function(modalId){
      if ($scope.path) {
        var permission = $scope.createPermission(null,null,$scope.path,$scope.permissions);
        var username =  $rootScope.selectedUser.get('uuid');
        ug.newUserPermission(permission, username);
        $scope.hideModal(modalId);
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a name for the permission.');
      }
    }


    if (!$rootScope.selectedUser) {
      $location.path('/users');
      return;
    } else {
      $rootScope.selectedUser.permissions = [];
      $rootScope.selectedUser.roles = [];
      $rootScope.selectedUser.getPermissions(function(err, data){
        if (err) {

        } else {
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

      });

      $rootScope.selectedUser.getRoles(function(err, data){
        if (err) {

        } else {
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

      });

      $scope.$on('role-update-received', function(event) {

        $rootScope.selectedUser.getRoles(function(err, data){
          if (err) {

          } else {
            if(!$rootScope.$$phase) {
              $rootScope.$apply();
            }
          }

        });

      });

      $scope.$on('permission-update-received', function(event) {

        $rootScope.selectedUser.getPermissions(function(err, data){
          if (err) {

          } else {
            if(!$rootScope.$$phase) {
              $rootScope.$apply();
            }
          }

        });

      });
    }


  }]);