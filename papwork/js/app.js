'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['experienceApp.filters', 'experienceApp.services', 'experienceApp.directives']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {template: '/partials/experience.html', controller: MyCtrl1});
    $routeProvider.when('/view2', {template: '/partials/partial2.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);