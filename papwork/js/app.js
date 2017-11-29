// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['experienceApp.filters', 'experienceApp.services', 'experienceApp.directives']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/experience', {template: '/partials/experience.html', controller: questionsCtrl});
    $routeProvider.when('/tool', { template: '/partials/partial2.html', controller: MyCtrl2 });
    $routeProvider.when('/cover', { template: '/partials/cover.html' });
    $routeProvider.when('/success', { template: '/partials/success.html' });
    $routeProvider.otherwise({ redirectTo: '/cover' });
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

  $(document).ready(function () {
      $(".checkbox-block input").click(function () {
          $(this).toggleClass('checked');
      })
      $(".smiley-rating .smiley div").click(function () {
          $(this).addClass("active").parent().siblings().find("div").removeClass("active");
      })
      $(".size-chart li").click(function () {
          $(this).addClass("active").siblings().removeClass("active");
      })
      $(".image-product-type .products").click(function () {
          if ($(this).hasClass("active"))
              $(this).removeClass("active");
          else
              $(this).addClass("active");
      })
  });