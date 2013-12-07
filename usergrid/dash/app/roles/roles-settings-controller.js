'use strict'

AppServices.Controllers.controller('RolesSettingsCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.settingsSelected = 'active';
    $scope.master = '';

    $scope.addRolePermissionDialog = function(modalId){
      if ($scope.path) {
        var permission = $scope.createPermission(null,null,$scope.path,$scope.permissions);
        var name =  $rootScope.selectedRole.get('name');
        ug.newRolePermission(permission, name);
        $scope.hideModal(modalId)
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a name for the permission.');
      }
    };

    $scope.deleteRolePermissionDialog = function(modalId){
      var name =  $rootScope.selectedRole.get('name');
      var permissions = $rootScope.selectedRole.permissions;
      for (var i=0;i<permissions.length;i++) {
        if (permissions[i].checked) {
          ug.deleteRolePermission(permissions[i].perm, name);
        }
      }
      $scope.hideModal(modalId)
    };

    $scope.getPermissions = function() {
      $rootScope.selectedRole.getPermissions(function(err, data){
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting permissions');
        } else {
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

      });
    }

    if (!$rootScope.selectedRole) {
      $location.path('/roles');
      return;
    } else {
      $rootScope.selectedRole.permissions = [];
      $rootScope.selectedRole.roles = [];
      $scope.getPermissions();

      $scope.$on('permission-update-received', function(event) {
        $scope.getPermissions();
      });

      $scope.$on('role-selection-changed', function() {
        $scope.getPermissions();
      });
    }

    $scope.updateInactivity = function() {
      $rootScope.selectedRole.save(function(err, data) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error saving inactivity value');
        } else {
          $rootScope.$broadcast('alert', 'success', 'inactivity value was updated');
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

      });
    }
  }]);