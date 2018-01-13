// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['ngRoute', 'experienceApp.filters', 'experienceApp.services', 'experienceApp.directives', 'experienceApp.controllers', 'ngMaterial', 'ngMessages', 'ngSanitize', 'ngDraggable', 'ngAnimate', 'swipe', 'ui.bootstrap.contextMenu']);

app.config(['$routeProvider', '$controllerProvider', '$mdThemingProvider', function ($routeProvider, $controllerProvider, $mdThemingProvider) {
    $routeProvider.when('/experience', { templateUrl: '/partials/experience.html'});
    $routeProvider.when('/create', { templateUrl: '/partials/create.html'});
    $routeProvider.when('/cover', { templateUrl: '/partials/cover.html'});
    $routeProvider.when('/success', { templateUrl: '/partials/success.html'});
    $routeProvider.otherwise({ redirectTo: '/experience' });
    $controllerProvider.allowGlobals();

    $mdThemingProvider.extendPalette('green', {
        'hue1': "#81c784"
    });

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
