'use strict'

AppServices.Controllers.controller('PushHistoryCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.notificationCollection = {}
    $scope.previous_display = 'none';
    $scope.next_display = 'none';

    $scope.historyList = [
      {name:'All',value:''},
      {name:'Scheduled',value:'SCHEDULED'},
      {name:'Sending',value:'STARTED'},
      {name:'Sent',value:'FINISHED'},
      {name:'Failed',value:'FAILED'},
      {name:'Canceled',value:'CANCELED'}
    ]

    $scope.selectedHistory = $scope.historyList[0]

    ug.getNotificationHistory();

    $scope.$watch('currentApp',function(){
      ug.getNotificationHistory();
    });

    $scope.$on('notifications-received', function(event, collection) {
      $scope.notificationCollection = collection;
      $scope.checkNextPrev();
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.showHistory = function(option) {
      $scope.selectedHistory = option;
      ug.getNotificationHistory(option.value);
    }

    $scope.viewReceipts = function(uuid){
      $rootScope.selectedNotification = $scope.notificationCollection.getEntityByUUID(uuid);
      $location.path('/push/history/receipts');
    }

    $scope.resetNextPrev = function() {
      $scope.previous_display = 'none';
      $scope.next_display = 'none';
    }

    $scope.checkNextPrev = function() {
      $scope.resetNextPrev();
      if ($scope.notificationCollection.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }
      if($scope.notificationCollection.hasNextPage()) {
        $scope.next_display = 'block';
      }
    }

    $scope.getPrevious = function () {
      $scope.notificationCollection.getPreviousPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting previous page');
        }
        $scope.checkNextPrev();
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      });
    };

    $scope.getNext = function () {

      $scope.notificationCollection.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page');
        }
        $scope.checkNextPrev();
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      });
    };

    $scope.getNotificationStartedDate = function(notification){
      return notification.started || notification.created;
    }

  }]);
