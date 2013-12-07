'use strict'

AppServices.Controllers.controller('UsersActivitiesCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.activitiesSelected = 'active';

    if (!$rootScope.selectedUser) {
      $location.path('/users');
      return;
    } else {
      $rootScope.selectedUser.activities = [];
      $rootScope.selectedUser.getActivities(function(err, data){
        if (err) {

        } else {
          if(!$rootScope.$$phase) {
            $rootScope.$apply();
          }
        }

      });
    }


  }]);