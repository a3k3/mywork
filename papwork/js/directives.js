'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */


var myapp = angular.module('experienceApp.directives', []);

myapp.directive('question', function () {
    return {
        restrict:'E',
        templateUrl: "../partials/pv_questionsTemplate.html"
    };
});

myapp.directive('apsUploadFile', apsUploadFile);

function apsUploadFile() {
    var directive = {
        restrict: 'E',
        templateUrl: '../partials/input_templates/upload.tmpl.html',
        link: apsUploadFileLink
    };
    return directive;
}

function apsUploadFileLink(scope, element, attrs) {
    var input = $(element[0].querySelector('#fileInput'));
    var button = $(element[0].querySelector('#uploadButton'));
    var textInput = $(element[0].querySelector('#textInput'));

    if (input.length && button.length && textInput.length) {
        button.click(function (e) {
            input.click();
        });
        textInput.click(function (e) {
            input.click();
        });
    }

    input.on('change', function (e) {
        var files = e.target.files;
        if (files[0]) {
            scope.fileName = files[0].name;
        } else {
            scope.fileName = null;
        }
        scope.$apply();
    });
}


function CarouselDirective() {

    function link(scope, element, attrs, ctrl) {
        if (attrs.autoSlide === undefined) {
            ctrl.autoSlide = false;
        }
        if (attrs.autoSlideTime === undefined) {
            ctrl.autoSlideTime = 5000;
        }
        ctrl.registerElement(element);
        scope.$on('$destroy', function () {
            ctrl.stopAutoSlide();
        });
        scope.$watch('ctrl.autoSlide', function () {
            ctrl.validateAutoSlide();
        });
        scope.$watch('ctrl.autoSlideTime', function () {
            ctrl.restartAutoSlide();
        });
    }

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'carousel-directive.html',
        scope: {},
        controller: 'mdCarouselController',
        controllerAs: 'ctrl',
        bindToController: {
            data: '=',
            itemTemplateUrl: '=',
            maxWidth: '@?',
            maxHeight: '@?',
            autoSlide: '@?',
            autoSlideTime: '@?'
        },
        link: link
    };
}

myapp.directive('mdCarousel', [
  CarouselDirective
  ]);