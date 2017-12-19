// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['ngRoute', 'experienceApp.filters', 'experienceApp.services', 'experienceApp.directives', 'experienceApp.controllers', 'ngMaterial', 'ngMessages', 'ngSanitize', 'ngAnimate', 'ngDraggable']);

app.config(['$routeProvider', '$controllerProvider', '$mdThemingProvider', function ($routeProvider, $controllerProvider, $mdThemingProvider) {
    $routeProvider.when('/experience', { templateUrl: '/partials/experience.html', animation: 'third' });
    $routeProvider.when('/create', { templateUrl: '/partials/create.html', animation: 'third' });
    $routeProvider.when('/cover', { templateUrl: '/partials/cover.html', animation: 'third' });
    $routeProvider.when('/success', { templateUrl: '/partials/success.html', animation: 'third' });
    $routeProvider.otherwise({ redirectTo: '/experience' });
    $controllerProvider.allowGlobals();


    //themeing
    $mdThemingProvider.theme('mytheme')
      .primaryPalette('green')
      .accentPalette('pink')
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