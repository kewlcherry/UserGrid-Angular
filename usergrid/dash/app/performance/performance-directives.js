'use strict';

AppServices.Directives.directive('infobox', function () {
  return{
    restrict: 'ECA',
    scope: {
      datasrc: '=datasrc',
      currentcompare: '=currentcompare'
    },
    transclude: true,
    templateUrl: 'performance/includes/info-box.html',
    replace: true,
    link: function linkFn(scope, lElement, attrs) {
      scope.title = attrs.title;
    }
  }
})