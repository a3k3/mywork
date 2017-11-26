// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['experienceApp.filters', 'experienceApp.services', 'experienceApp.directives']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/view1', {template: '/partials/experience.html', controller: MyCtrl1});
    $routeProvider.when('/view2', {template: '/partials/partial2.html', controller: MyCtrl2});
    $routeProvider.otherwise({redirectTo: '/view1'});
  }]);


  updateZoom = function (index, element) {
      var $slide = $(element),
          $index = parseInt($slide.find('.questionPanel').data('question-id')) - 1,
          distanceFromTopOfViewport = Math.abs($index * $slide.height() * 6 - $(document).scrollTop());
      //$slide.find('h2').css({
      //    zoom: 2 - distanceFromTopOfViewport / $slide.height()
      //});
      var ratio = distanceFromTopOfViewport / ($slide.height() * $index);
      $slide.css({
          zoom: 7 - (ratio <= 1 ? 1 : ratio)
      });
      $slide.find('.questionPanel').css({
          zoom: (20 + (ratio/2)*10)+"%"
      });
      $slide.find('.answerContainer').css({
          opacity: (6 - ratio)/6
      });

      if (ratio < 1) {
          $slide.addClass('active').removeAttr('style');
          $slide.prev().addClass('visited').removeClass('active');
      }
  };

  $(window).on('load', function () {
      $(".active + question").each(updateZoom);
  });

  $(document).scroll(function () {
      $(".active + question").each(updateZoom);
  });