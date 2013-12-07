'use strict'

AppServices.Controllers.controller('UsersProfileCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.profileSelected = 'active';

    if (!$rootScope.selectedUser) {
      $location.path('/users');
      return;
    }

    $rootScope.saveSelectedUser = function(){

      $rootScope.selectedUser.save(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error saving user');
        } else {
          $rootScope.$broadcast('alert', 'success', 'user saved');
        }
      });

    }

  }]);