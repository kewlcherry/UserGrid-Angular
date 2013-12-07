'use strict';

AppServices.Directives.directive('slidecheckbox', ["$rootScope", function ($rootScope) {
  return{
    restrict: 'ECA',
    scope: {
      data: '=data'
    },
    templateUrl: 'configure/checkbox-template.html',
    replace: true,
    transclude: true,
    link: function linkFn(scope, lElement, attrs) {
      scope.label = attrs.label;
    }
  }
}])