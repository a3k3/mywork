'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$filter */

var myfilter = angular.module('experienceApp.filters', []);

myfilter.filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]);

myfilter.filter('formatMoney', [function () {
    return function(text) {
        return String(text).replace();
    }
}]);
