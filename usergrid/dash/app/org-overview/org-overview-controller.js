'use strict'

AppServices.Controllers.controller('OrgOverviewCtrl', ['ug', '$scope','$rootScope', '$routeParams', '$location', function (ug, $scope, $rootScope, $routeParams, $location) {

  var init = function(){
    //deal with double firing initialization logic
    var orgName = ug.client().get('orgName');
    var orgUUID = '';
    if (orgName) {
      var orgUUID = ug.client().getObject('organizations')[orgName].uuid;
    } else {
      $rootScope.$broadcast('userNotAuthenticated');
      return;
    }
    $scope.currentOrganization = {"name":orgName,"uuid":orgUUID};
    $scope.applications = [{"name":"...", "uuid":"..."}];
    $scope.orgAdministrators = [];
    $scope.activities = [];
    $scope.orgAPICredentials = {"client_id":"...", "client_secret":"..."};

    ug.getApplications();
    ug.getOrgCredentials();
    ug.getAdministrators();
    ug.getFeed();
  }

  $scope.$watch('currentOrg',function(newval,oldval){
     init();
  });

  //-------modal logic
  $scope.regenerateCredentialsDialog = function(modalId){
    $scope.orgAPICredentials = {client_id:'regenerating...',client_secret:'regenerating...'};
    ug.regenerateOrgCredentials();
    $scope.hideModal(modalId);
  };



  $scope.newAdministratorDialog = function(modalId){
    //todo: put more validate here
    if ($scope.email) {
      ug.createAdministrator($scope.email);
      $scope.hideModal(modalId);
      $rootScope.$broadcast('alert', 'success', 'Administrator created successfully.');
    } else {
      $rootScope.$broadcast('alert', 'error', 'You must specify an email address.');
    }

  };



  $scope.$on('applications-received', function(event, applications) {
    $scope.applications = applications;
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });

  $scope.$on('administrators-received', function(event, administrators) {
    $scope.orgAdministrators = administrators;
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });

  $scope.$on('org-creds-updated', function(event, credentials) {
    $scope.orgAPICredentials = credentials;
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });

  $scope.$on('feed-received', function(event, feed) {
    $scope.activities = feed;
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });



}]);
