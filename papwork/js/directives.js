'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */


var myapp = angular.module('experienceApp.directives', ['ngSanitize']);

myapp.directive('question', function () {
    return {
        restrict:'E',
        templateUrl: "../partials/pv_questionsTemplate.html"
    };
});

myapp.directive('apsUploadFile', apsUploadFile);

function apsUploadFile() {
    var directive = {
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

myapp.directive('contenteditable', ['$sce', function($sce) {
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function() {
                element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                read(); // initialize
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function() {
                scope.$evalAsync(read);
            });

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if ( attrs.stripBr && html == '<br>' ) {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
}]);