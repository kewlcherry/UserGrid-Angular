'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('AppServices.services', []).value('version', '0.1');


AppServices.Services.factory('LocalData', function ($resource) {
  return function (filename) {
    return $resource('http://localhost\\:8001/app/js/:filename',
        {
          filename: (filename || 'rawlog.json')
        }, {
          getData: {method: 'GET', isArray: false}
        });
  }
});

AppServices.Services.factory('myService', function ($http) {
  var myService = {
    async: function (url) {
      // $http returns a promise, which has a then function, which also returns a promise
      var promise = $http.get(url).then(function (response) {
        // The then function here is an opportunity to modify the response
        // The return value gets picked up by the then in the controller.
        return response.data;
      });
      // Return the promise to the controller
      return promise;
    }
  };
  return myService;
});
