// Declare app level module which depends on filters, and services
var app = angular.module('experienceApp', ['ngRoute', 'experienceApp.filters', 'experienceApp.services', 'experienceApp.directives', 'experienceApp.controllers', 'ngMaterial', 'ngMessages', 'mdCarousel.templates']);

app.config(['$routeProvider', '$controllerProvider', '$mdThemingProvider', function ($routeProvider, $controllerProvider, $mdThemingProvider) {
    $routeProvider.when('/experience', { templateUrl: '/partials/experience.html'});
    $routeProvider.when('/create', { templateUrl: '/partials/create.html'});
    $routeProvider.when('/cover', { templateUrl: '/partials/cover.html' });
    $routeProvider.when('/success', { templateUrl: '/partials/success.html' });
    $routeProvider.otherwise({ redirectTo: '/experience' });
    $controllerProvider.allowGlobals();


    //themeing
    $mdThemingProvider.theme('mytheme')
      .primaryPalette('green')
      .accentPalette('pink')
      .warnPalette('red');

}]);

(function () { angular.module("mdCarousel.templates", []).run(["$templateCache", function ($templateCache) { $templateCache.put("carousel-directive.html", "<div class=\"md-carousel\" >\n\n  <div class=\"slides-container\" layout=\"row\" >\n    <div\n      ng-repeat=\"slideItem in ctrl.cloneData\"\n      class=\"slide\"\n    >\n      <div ng-include=\"ctrl.itemTemplateUrl\" ></div>\n    </div>\n  </div>\n\n  <md-button class=\"md-icon-button left-arrow-button\" >\n    <md-icon ng-click=\"ctrl.navigateLeft()\" >chevron_left</md-icon>\n  </md-button>\n\n  <md-button class=\"md-icon-button right-arrow-button\" >\n    <md-icon ng-click=\"ctrl.navigateRight()\" >chevron_right</md-icon>\n  </md-button>\n\n  <md-radio-group\n    class=\"radio-buttons-container\"\n    layout=\"row\"\n    ng-model=\"ctrl.radioButtonIndex\"\n    layout-align=\"center center\"\n    ng-change=\"ctrl.onRadioButtonClick()\" >\n    <md-radio-button\n      ng-repeat=\"item in ctrl.data\"\n      ng-value=\"$index\"\n      aria-label=\"$index\" >\n    </md-radio-button>\n  </md-radio-group>\n\n</div>\n"); }]); })();


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