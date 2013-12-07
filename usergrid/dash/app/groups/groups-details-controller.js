'use strict'

AppServices.Controllers.controller('GroupsDetailsCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.detailsSelected = 'active';

    if (!$rootScope.selectedGroup) {
      $location.path('/groups');
      return;
    }

    $rootScope.saveSelectedGroup = function(){

      $rootScope.selectedGroup.save(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error saving group');
        } else {
          $rootScope.$broadcast('alert', 'success', 'group saved');
        }
      });

    }

  }]);