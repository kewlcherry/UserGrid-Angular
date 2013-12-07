'use strict';
//todo - where does angular recommend we put polyfills????
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(/* function */ callback, /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
    };
})();

var AppServices = AppServices || {};

AppServices.Constants = angular.module('appservices.constants', []);
AppServices.Services = angular.module('appservices.services', []);
AppServices.Controllers = angular.module('appservices.controllers', []);
AppServices.Filters = angular.module('appservices.filters', []);
AppServices.Directives = angular.module('appservices.directives', []);
AppServices.Dialog = angular.module('appservices.dialog', ['ui.bootstrap']);

//todo may want to try this https://groups.google.com/forum/#!msg/angular/YXmGKO7bz3Q/wRcxIXWf38AJ

angular.module('appservices',
    ['ngResource',
      'appservices.filters',
      'appservices.services',
      'appservices.directives',
      'appservices.constants',
      'appservices.dialog',
      'appservices.controllers']).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider
//      .when('/performance', {templateUrl: 'performance/errors-crashes.html', controller: 'PerformanceCtrl'})
//        .when('/performance/app-overview', {templateUrl: 'performance/app-overview.html'})
      .when('/performance/errors-crashes', {templateUrl: 'performance/errors-crashes.html', controller: 'PerformanceCtrl', reloadOnSearch: false})
      .when('/performance/api-perf', {templateUrl: 'performance/api-perf.html', controller: 'PerformanceCtrl', reloadOnSearch: false})
      .when('/performance/app-usage', {templateUrl: 'performance/app-usage.html', controller: 'PerformanceCtrl', reloadOnSearch: false})
      .when('/performance/custom-events', {templateUrl: 'performance/custom-events.html', controller: 'PerformanceCtrl', reloadOnSearch: false})

      .when('/configure', {templateUrl: 'configure/default-config.html', controller: 'ConfigureCtrl'})
      .when('/configure/default-configs', {templateUrl: 'configure/default-config.html', controller: 'ConfigureCtrl'})
      .when('/configure/beta-configs', {templateUrl: 'configure/beta-config.html', controller: 'ConfigureCtrl'})
      .when('/configure/ab-configs', {templateUrl: 'configure/ab-config.html', controller: 'ConfigureCtrl'})
      .when('/configure/event-configs', {templateUrl: 'configure/event-config.html', controller: 'ConfigureCtrl'})


      .when('/org-overview', {templateUrl: 'org-overview/org-overview.html', controller: 'OrgOverviewCtrl'})
      .when('/login', {templateUrl: 'login/login.html', controller: 'LoginCtrl'})
      .when('/login/loading', {templateUrl: 'login/loading.html', controller: 'LoginCtrl'})
      .when('/app-overview/summary', {templateUrl: 'app-overview/app-overview.html', controller: 'AppOverviewCtrl'})
      .when('/getting-started/setup', {templateUrl: 'app-overview/getting-started.html', controller: 'GettingStartedCtrl'})
      .when('/users', {templateUrl: 'users/users.html', controller: 'UsersCtrl'})
      .when('/users/profile', {templateUrl: 'users/users-profile.html', controller: 'UsersProfileCtrl'})
      .when('/users/groups', {templateUrl: 'users/users-groups.html', controller: 'UsersGroupsCtrl'})
      .when('/users/activities', {templateUrl: 'users/users-activities.html', controller: 'UsersActivitiesCtrl'})
      .when('/users/graph', {templateUrl: 'users/users-graph.html', controller: 'UsersGraphCtrl'})
      .when('/users/roles', {templateUrl: 'users/users-roles.html', controller: 'UsersRolesCtrl'})
      .when('/groups', {templateUrl: 'groups/groups.html', controller: 'GroupsCtrl'})
      .when('/groups/details', {templateUrl: 'groups/groups-details.html', controller: 'GroupsDetailsCtrl'})
      .when('/groups/members', {templateUrl: 'groups/groups-members.html', controller: 'GroupsMembersCtrl'})
      .when('/groups/activities', {templateUrl: 'groups/groups-activities.html', controller: 'GroupsActivitiesCtrl'})
      .when('/groups/roles', {templateUrl: 'groups/groups-roles.html', controller: 'GroupsRolesCtrl'})
      .when('/roles', {templateUrl: 'roles/roles.html', controller: 'RolesCtrl'})
      .when('/roles/settings', {templateUrl: 'roles/roles-settings.html', controller: 'RolesSettingsCtrl'})
      .when('/roles/users', {templateUrl: 'roles/roles-users.html', controller: 'RolesUsersCtrl'})
      .when('/roles/groups', {templateUrl: 'roles/roles-groups.html', controller: 'RolesGroupsCtrl'})

      .when('/push/sendNotification', {templateUrl: 'push/push-send-notification.html', controller: 'PushSendNotificationCtrl'})
      .when('/push/getStarted', {templateUrl: 'push/push-get-started.html', controller: 'PushGetStartedCtrl'})
      // .when('/push/configuration', {templateUrl: 'push/push-config.html', controller: 'PushConfigCtrl'})
      .when('/push/history', {templateUrl: 'push/push-history.html', controller: 'PushHistoryCtrl'})
      .when('/push/history/receipts', {templateUrl: 'push/push-receipts.html', controller: 'PushReceiptsCtrl'})
      .when('/push/configuration', {templateUrl: 'push/push-config.html', controller: 'PushConfigCtrl'})

      .when('/data', {templateUrl: 'data/data.html', controller: 'DataCtrl'})
      .when('/data/entity', {templateUrl: 'data/entity.html', controller: 'EntityCtrl'})
      .when('/data/shell', {templateUrl: 'data/shell.html', controller: 'ShellCtrl'})

      .when('/profile', {templateUrl: 'profile/profile.html', controller: 'ProfileCtrl'})

      //.when('/data/:pageId')

      .otherwise({redirectTo: '/org-overview'});

    $locationProvider
      .html5Mode(false)
      .hashPrefix('!');
  }]);
