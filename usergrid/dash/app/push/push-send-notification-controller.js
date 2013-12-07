'use strict'

AppServices.Controllers.controller('PushSendNotificationCtrl', ['ug', '$scope', '$rootScope', '$location', 'data',
  function (ug, $scope, $rootScope, $location, data) {

    $scope.send = {};
    $scope.send.selectedNotifier = {};
    $scope.send.controlGroup = 'all';
    $scope.send.deliveryPeriod = {};
    $scope.controlGroup = 'all';
    $scope.notifiersCollection = {};

    ug.getNotifiers();



    $scope.$on('notifiers-received', function(event, collection) {
      $scope.notifiersCollection = collection._list;
      console.log(collection)
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    });


    $scope.selectDevices = function() {


    }

    $scope.scheduleNotification = function() {

      if($scope.send.$valid){

        var optionList = '';
        var type = $scope.send.controlGroup;
        var payload = {payloads:{},deliver:null};
        payload.payloads[$scope.send.selectedNotifier._data.name] = $scope.send.notifierMessage;


        if(type !== 'all'){
          //get whatever is selected in the radio button options
          optionList = $scope.send[type]
          angular.forEach(optionList, function(value, index){
            var path = type + '/' + value + '/notifications';
            ug.sendNotification(path, payload);
          });
        }else{
          ug.sendNotification('devices;ql=/notifications', payload);
        }

        $rootScope.$broadcast('alert', 'success', 'Notifications have been queued.');

      }


    }

//    todo - this is copied over from old portal for calendar component

    $('#notification-schedule-time-date').datepicker();
    $('#notification-schedule-time-date').datepicker('setDate', Date.last().sunday());
    $('#notification-schedule-time-time').val("12:00 AM");
    $('#notification-schedule-time-time').timepicker({
      showPeriod: true,
      showLeadingZero: false
    });

    function pad(number, length){
      var str = "" + number
      while (str.length < length) {
        str = '0'+str
      }
      return str
    }

    var offset = new Date().getTimezoneOffset();
    offset = ((offset<0? '+':'-') + pad(parseInt(Math.abs(offset/60)), 2) + pad(Math.abs(offset%60), 2));

    $('#gmt_display').html('GMT ' + offset);

  }]);