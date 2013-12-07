'use strict'

AppServices.Controllers.controller('UsersCtrl', ['ug', '$scope', '$rootScope', '$location','$route',
  function (ug, $scope, $rootScope, $location, $route) {

  $rootScope.usersCollection = {};
  $rootScope.selectedUser = {};
  $scope.previous_display = 'none';
  $scope.next_display = 'none';

  $scope.currentUsersPage = {};
//  $scope.$route = $route;

  $scope.selectUserPage = function(route){
    //lokup the template URL with the route. trying to preserve routes in the markup and not hard link to .html
    $scope.currentUsersPage.template = $route.routes[route].templateUrl;
    $scope.currentUsersPage.route = route;
  }



  //-----modals
  $scope.deleteUsersDialog = function(modalId){
    $scope.deleteEntities($rootScope.usersCollection, 'user-deleted', 'error deleting user');
    $rootScope.$broadcast('alert', 'success', 'User deleted successfully.');
    $scope.hideModal(modalId);
  }

  $scope.newUserDialog = function(modalId){
    //todo: put more validate here
    if ($scope.username && $scope.name && $scope.email && $scope.password && $scope.repassword && ($scope.password == $scope.repassword)) {
      ug.createUser($scope.username,$scope.name,$scope.email,$scope.password);
      $rootScope.$broadcast('alert', 'success', 'New user created successfully.');
      $scope.hideModal(modalId);
    } else {
      $rootScope.$broadcast('alert', 'error', 'Missing required information.');
    }
  }

  $scope.$watch('currentApp',function(){
    ug.getUsers();
  })

  $scope.$on('users-received', function(event, users) {
    $rootScope.usersCollection = users;

    if(users._list.length > 0){
      $scope.selectUser(users._list[0]._data.uuid)
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
    if ($scope.usersCollection.hasPreviousPage()) {
      $scope.previous_display = '';
    }
    if($scope.usersCollection.hasNextPage()) {
      $scope.next_display = '';
    }
  }

  $scope.selectUser = function(uuid){
    $rootScope.selectedUser = $rootScope.usersCollection.getEntityByUUID(uuid);
//    $location.path('/users/profile');
    $scope.currentUsersPage.template = 'users/users-profile.html';
    $scope.currentUsersPage.route = '/users/profile';
  }

  $scope.getPrevious = function () {
    $rootScope.usersCollection.getPreviousPage(function(err) {
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
    $rootScope.usersCollection.getNextPage(function(err) {
      if (err) {
        $rootScope.$broadcast('alert', 'error', 'error getting next page of users');
      }
      $scope.checkNextPrev();
      if(!$rootScope.$$phase) {
        $rootScope.$apply();
      }
    });
  };

  $scope.$on('user-deleted', function(event) {
    $scope.master = '';
  });


}]);