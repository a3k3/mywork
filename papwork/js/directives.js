'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */


var mydir = angular.module('experienceApp.directives', []);

mydir.directive('question', function () {
    return {
        restrict:'E',
        templateUrl: "../partials/pv_questionsTemplate.html"
    };
});
