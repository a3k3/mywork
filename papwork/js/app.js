// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['ngRoute', 'experienceApp.filters', 'experienceApp.services', 'experienceApp.directives', 'experienceApp.controllers', 'ngMaterial', 'ngMessages', 'ngSanitize', 'ngDraggable', 'ngAnimate', 'swipe', 'ui.bootstrap.contextMenu', 'sir-accordion']);

app.config(['$routeProvider', '$controllerProvider', '$mdThemingProvider', '$sceDelegateProvider', function ($routeProvider, $controllerProvider, $mdThemingProvider, $sceDelegateProvider) {
    $routeProvider.when('/experience', { templateUrl: '/partials/experience.html'});
    $routeProvider.when('/create', { templateUrl: '/partials/create.html'});
    $routeProvider.when('/cover', { templateUrl: '/partials/cover.html'});
    $routeProvider.when('/success', { templateUrl: '/partials/success.html'});
    $routeProvider.otherwise({ redirectTo: '/create' });
    $controllerProvider.allowGlobals();

    $mdThemingProvider.extendPalette('green', {
        'hue1': "#bece66"
    });

    //themeing
    $mdThemingProvider.theme('mytheme')
      .primaryPalette('green')
      .accentPalette('pink')
      .warnPalette('red');

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://scontent.xx.fbcdn.net/*'
    ]);

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