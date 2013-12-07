'use strict'

AppServices.Controllers.controller('PushConfigCtrl', ['ug', '$scope', '$rootScope', '$routeParams', '$location', function (ug, $scope, $rootScope, $routeParams, $location) {

  $scope.notifier = {};
  $scope.notifier.appleNotifierCert = [];
  $scope.notifier.appleNotifierName = '';
  $scope.notifier.appleEnvironment = '';
  $scope.notifier.notifierCertPassword = '';
  $scope.notifier.androidNotifierName = '';
  $scope.notifier.androidNotifierAPIKey = '';



  $rootScope.notifiersCollection = {};

  ug.getNotifiers();
  $scope.$watch('currentApp',function(){
    ug.getNotifiers();
  });

  $scope.$on('notifiers-received', function(event, collection) {
    $scope.notifiersCollection = collection;
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  });

  $scope.deleteNotifiersDialog = function(modalId){
    $scope.deleteEntities($scope.notifiersCollection, 'notifier-update', 'error deleting notifier');
    $rootScope.$broadcast('alert', 'success', 'Notifier deleted successfully.');
    $scope.hideModal(modalId);
  }

  $rootScope.createAppleNotifier = function() {
    //$scope.appleNotifierCert - this comes from the directive below
    ug.createAppleNotifier($scope.appleNotifierCert, $scope.notifier.appleNotifierName, $scope.notifier.appleEnvironment, $scope.notifier.notifierCertPassword);
  }

  $rootScope.createAndroidNotifier = function() {
    ug.createAndroidNotifier($scope.notifier.androidNotifierName, $scope.notifier.androidNotifierAPIKey);
  }

  $scope.$on('notifier-update', function(event) {
    ug.getNotifiers();
  });

}]);

AppServices.Controllers.directive('file', function(){
  return {
    scope: {
      file: '='
    },
    link: function(scope, el, attrs){
      el.bind('change', function(event){
        var files = event.target.files;
        scope.$parent.$parent.$parent.$parent.appleNotifierCert = files[0];
        scope.$parent.$parent.$parent.$parent.$apply();

      });
    }
  };
});
