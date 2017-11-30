// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['ngRoute', 'experienceApp.filters', 'experienceApp.services', 'experienceApp.directives', 'experienceApp.controllers', 'ngMaterial']);

app.config(['$routeProvider', '$controllerProvider', '$mdThemingProvider', function ($routeProvider, $controllerProvider, $mdThemingProvider) {
    $routeProvider.when('/experience', { templateUrl: '/partials/experience.html'});
    $routeProvider.when('/tool', { templateUrl: '/partials/partial2.html'});
    $routeProvider.when('/cover', { templateUrl: '/partials/cover.html' });
    $routeProvider.when('/success', { templateUrl: '/partials/success.html' });
    $routeProvider.otherwise({ redirectTo: '/cover' });
    $controllerProvider.allowGlobals();


    //themeing
    $mdThemingProvider.theme('mytheme')
      .primaryPalette('blue', {
          'default': '400', // by default use shade 400 from the pink palette for primary intentions
          'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
          'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
          'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
      })
      .accentPalette('green')
      .warnPalette('red');
  }]);


  var timeoutId;
  $(window).bind('mousewheel', function (event) {
      if (timeoutId) {
          clearTimeout(timeoutId);
      }
      if (event.originalEvent.wheelDelta >= 0) {
          timeoutId = setTimeout(function () { $('.prev').trigger('click'); }, 300);
      }
      else {
          timeoutId = setTimeout(function () { $('.next').trigger('click'); }, 300);
      }
  });
  //$(window).on("scroll", function () {
  //    alert();
  //})