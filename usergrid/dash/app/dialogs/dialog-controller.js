
AppServices.Controllers.controller('DialogCtrl', ['ug', '$scope', '$rootScope', '$dialog', '$filter', function (ug, $scope, $rootScope, $dialog, dialog, $filter) {

  //==========================================
  // dialog boxes
  //==========================================
  $scope.cancel = function() {
    $rootScope.dialogBox.close(); //had to use rootscope because dialog was not in scope on close
  }

  $scope.opts = {
    backdrop: true,
    keyboard: true,
    backdropClick: true,
    controller: 'DialogCtrl',
    templateUrl: 'dialogs/new-admin.html',
  };













/*
   Todo: binding is not working on the callback if the typeahead is already displayed.
   some quick searching says we either need to use promises or angular ui
   for now, we will just get the first 100 in the beginning, which will work for many users

   // ng-keyup="onUserSearchKeyPress()"
   $scope.onUserSearchKeyPress = function() {
     var searchValue = $scope.username;
     ug.getUsersTypeAhead(searchValue + '*');
   }
*/









  //==========================================
  // message boxes
  //=========================================  };


  $scope.deleteEntitiesDialog = function(){
    var title = 'Confirmation';
    var msg = 'Are you sure you want to delete the entities(s)?';
    var btns = [{result:'cancel', label: 'Cancel'}, {result:'yes', label: 'Yes', cssClass: 'btn-primary'}];

    $dialog.messageBox(title, msg, btns)
      .open()
      .then(function(result){
        if (result === 'yes') {

          $scope.deleteEntities($rootScope.queryCollection, 'entity-deleted', 'error deleting entity');

        }
      });
  };


  $scope.deleteNotifiersDialog = function(){
    var title = 'Confirmation';
    var msg = 'Are you sure you want to delete the notifier(s)?';
    var btns = [{result:'cancel', label: 'Cancel'}, {result:'yes', label: 'Yes', cssClass: 'btn-primary'}];

    $dialog.messageBox(title, msg, btns)
      .open()
      .then(function(result){
        if (result === 'yes') {

          $scope.deleteEntities($rootScope.notifiersCollection, 'notifier-deleted', 'error deleting notifier');
          /*
          $rootScope.notifiersCollection.resetEntityPointer();
          while($rootScope.notifiersCollection.hasNextEntity()) {
            var entity = $rootScope.notifiersCollection.getNextEntity();
            var checked = entity.checked;
            if(checked){
              $rootScope.notifiersCollection.destroyEntity(entity, function(err){
                if(err){
                  $rootScope.$broadcast('alert', 'error', 'error deleting notifier');
                }
                $rootScope.$broadcast('notifier-deleted');
                if(!$scope.$$phase) {
                  $scope.$apply();
                }
              });

            }
          }
          */

        }
      });
  };





















}]);
