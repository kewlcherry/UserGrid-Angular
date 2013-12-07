'use strict'

AppServices.Controllers.controller('LoginCtrl', ['ug', '$scope', '$rootScope', '$routeParams', '$location', 'utility', function (ug, $scope, $rootScope, $routeParams, $location, utility) {

  $scope.login = function() {
//    $rootScope.currentPath = '/login';
    var username = $scope.login_username;
    var password = $scope.login_password;

    ug.client().set('email', username);
    ug.client().set('token', null);

    ug.client().orgLogin(username, password, function (err, data, user, organizations, applications) {
      if (err){
        //let the user know the login was not valid
        $scope.loginMessage = "Error: the username / password combination was not valid";
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      } else {
        $rootScope.$broadcast('loginSuccesful', user, organizations, applications);
      }
    });
  }

  $scope.logout = function() {
    ug.client().logout();
    $rootScope.activeUI = false;

    $rootScope.userEmail = 'user@apigee.com';
    $rootScope.organizations = {"noOrg":{name:"No Orgs Found"}};
    $rootScope.applications = {"noApp":{name:"No Apps Found"}};
    $rootScope.currentOrg = 'No Org Found';
    $rootScope.currentApp = 'No App Found';
    localStorage.setItem('accessToken', null);
    localStorage.setItem('userUUID', null);
    localStorage.setItem('userEmail', null);

    if($scope.use_sso){
      window.location = $rootScope.urls().LOGOUT_URL + '?callback=' + encodeURIComponent($location.absUrl());
    }else{
      $location.path('/login');
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    }

  }


  $rootScope.$on('userNotAuthenticated', function(event) {
    $location.path('/login');

    $scope.logout();

    if(!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  });



  $scope.$on('loginSuccesful', function(event, user, organizations, applications) {

    //update org and app dropdowns

    $rootScope.userEmail = user.get('email');
    $rootScope.organizations = ug.client().getObject('organizations');
    $rootScope.applications = ug.client().getObject('applications');
    $rootScope.currentOrg = ug.client().get('orgName');
    $rootScope.currentApp = ug.client().get('appName');
    $rootScope.currentUser = user._data;
    $rootScope.currentUser.profileImg = utility.get_gravatar($rootScope.currentUser.email);

    //boolean defines is top level ui menus/buttons should be active/shown
    $rootScope.activeUI = true;

    //if on login page, send to org overview page.  if on a different page, let them stay there
    if ($rootScope.currentPath === '/login' || $rootScope.currentPath === '/login/loading' || typeof $rootScope.currentPath === 'undefined') {
      $location.path('/org-overview');
    } else {
      $location.path($rootScope.currentPath);
    }
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });


}]);