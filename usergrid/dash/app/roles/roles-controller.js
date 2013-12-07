'use strict'

AppServices.Controllers.controller('RolesCtrl', ['ug', '$scope', '$rootScope', '$location', '$route',
  function (ug, $scope, $rootScope, $location, $route) {

    $rootScope.rolesCollection = {};
    $rootScope.selectedRole = {};
    $scope.previous_display = 'none';
    $scope.next_display = 'none';
    $scope.roles_check_all = '';
    $scope.rolename = '';

    $scope.currentRolesPage = {};
//  $scope.$route = $route;

    $scope.selectRolePage = function(route){
      //lokup the template URL with the route. trying to preserve routes in the markup and not hard link to .html
      $scope.currentRolesPage.template = $route.routes[route].templateUrl;
      $scope.currentRolesPage.route = route;
    }

    ug.getRoles();

    $scope.newRoleDialog = function(modalId){
      if ($scope.rolename) {
        //add new role here
        $rootScope.$broadcast('alert', 'success', 'Role created successfully.');
        $scope.hideModal(modalId)
      } else {
        $rootScope.$broadcast('alert', 'error', 'You must specify a role name.');
      }
    };

    $scope.deleteRoleDialog = function(modalId){
      //delete role here
      $rootScope.$broadcast('alert', 'success', 'Role deleted successfully.');
      $scope.hideModal(modalId)
    };

    $scope.$on('roles-received', function(event, roles) {
      $rootScope.rolesCollection = roles;

      if(roles._list.length > 0){
        $scope.selectRole(roles._list[0]._data.uuid)
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
      if ($scope.rolesCollection.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }

      if($scope.rolesCollection.hasNextPage()) {
        $scope.next_display = 'block';
      }
    }

    $scope.selectRole = function(uuid){
      $rootScope.selectedRole = $rootScope.rolesCollection.getEntityByUUID(uuid);
      console.log('---selectRole',$rootScope.selectedRole)
      $scope.currentRolesPage.template = 'roles/roles-settings.html';
      $scope.currentRolesPage.route = '/roles/settings';
      $rootScope.$broadcast('role-selection-changed', $rootScope.selectedRole);
    }

    $rootScope.checkAll = function(){
      $rootScope.rolesCollection.resetEntityPointer();
      while( $rootScope.rolesCollection.hasNextEntity()) {
        var role =  $rootScope.rolesCollection.getNextEntity();
        if (!role.get('checked')) {
          role.set('checked', true);
        } else {
          role.set('checked', null);
        }
      }
    }

    $scope.getPrevious = function () {
      $rootScope.rolesCollection.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page of roles');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.getNext = function () {
      $rootScope.rolesCollection.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page of roles');
        }
        $scope.checkNextPrev();
        if(!$rootScope.$$phase) {
          $rootScope.$apply();
        }
      });
    };

    $scope.$on('role-deleted', function(event) {
      $scope.master = '';
    });


  }]);