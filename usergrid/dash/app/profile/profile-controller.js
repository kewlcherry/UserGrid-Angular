'use strict'

AppServices.Controllers.controller('ProfileCtrl', ['$scope', '$rootScope', 'ug', 'utility',
  function ($scope, $rootScope, ug,utility) {

    $scope.saveUserInfo = function(){
      ug.updateUser(function(err,data){

        if(!err){
          $rootScope.$broadcast('alert', 'success', 'Profile information updated successfully!');
        }

        if($rootScope.currentUser.oldPassword && $rootScope.currentUser.newPassword != 'undefined'){
          //update password after userinfo update
          ug.resetUserPassword(function(err,data){
            if(!err){
              $rootScope.$broadcast('alert', 'success', 'Password updated successfully!');
            }
          })
        }

      })

    }


  }]);