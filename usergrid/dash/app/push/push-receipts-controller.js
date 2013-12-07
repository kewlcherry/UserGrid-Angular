'use strict'

AppServices.Controllers.controller('PushReceiptsCtrl', ['ug', '$scope', '$rootScope', '$location',
  function (ug, $scope, $rootScope, $location) {

    $scope.receiptsCollection = {}
    $scope.previous_display = 'none';
    $scope.next_display = 'none';

    $scope.statusList = [
      {name:'All',value:''},
      {name:'Received',value:'RECEIVED'},
      {name:'Failed',value:'FAILED'}
    ]

    $scope.selectedStatus = $scope.statusList[0]

    if (!$rootScope.selectedNotification) {
      $location.path('/push/history');
    }

    ug.getNotificationReceipts($rootScope.selectedNotification.get('uuid'));

    $scope.$on('receipts-received', function(event, collection) {
      $scope.receiptsCollection = collection;
      $scope.checkNextPrev();
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });

    $scope.showHistory = function(type) {
      ug.getNotificationReceipts($rootScope.selectedNotification.get('uuid'));
    }

    $scope.showReceipts = function(option) {
      $scope.selectedStatus = option;
      ug.getNotificationReceipts($rootScope.selectedNotification.get('uuid'),option.value);
    }

    $scope.resetNextPrev = function() {
      $scope.previous_display = 'none';
      $scope.next_display = 'none';
    }
    $scope.checkNextPrev = function() {
      $scope.resetNextPrev();
      if ($scope.receiptsCollection.hasPreviousPage()) {
        $scope.previous_display = 'block';
      }
      if($scope.receiptsCollection.hasNextPage()) {
        $scope.next_display = 'block';
      }
    }

    $scope.getPrevious = function () {
      $scope.receiptsCollection.getPreviousPage(function(err) {
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

      $scope.receiptsCollection.getNextPage(function(err) {
        if (err) {
          $rootScope.$broadcast('alert', 'error', 'error getting next page');
        }
        $scope.checkNextPrev();
        if(!$scope.$$phase) {
          $scope.$apply();
        }
      });
    };

  }]);