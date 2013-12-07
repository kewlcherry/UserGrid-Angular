'use strict';

AppServices.Directives.directive('bsmodal', ["$rootScope", function ($rootScope) {
  return{
    restrict: 'ECA',
    scope: {
      title: '@title',
      footertext: '=footertext',
      closelabel: '=closelabel'
    },
    transclude: true,
    templateUrl: 'dialogs/modal.html',
    replace: true,
    link: function linkFn(scope, lElement, attrs, parentCtrl) {
      scope.title = attrs.title;
      scope.footertext = attrs.footertext;
      scope.closelabel = attrs.closelabel;
      scope.close = attrs.close;
      scope.extrabutton = attrs.extrabutton;
      scope.extrabuttonlabel = attrs.extrabuttonlabel;



      scope.closeDelegate = function(attr){
        //always call method in parent controller scope
        scope.$parent[attr](attrs.id)
      }

      scope.extraDelegate = function(attr){
        //always call method in parent controller scope
        scope.$parent[attr](attrs.id)
      }
    }
  }
}])