'use strict';

/* Filters */

AppServices.Filters.filter('interpolate', ['version', function (version) {
  return function (text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  }
}]);
