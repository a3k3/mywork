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
  //$(window).on("scroll", function () {
  //    alert();
//})

  $(document).ready(function () {
      $(".smiley-rating .smiley div").on('click',function () {
          $(this).addClass("active").parent().siblings().find("div").removeClass("active");
      })
  });