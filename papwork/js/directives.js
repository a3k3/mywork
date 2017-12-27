'use strict';
/* http://docs-next.angularjs.org/api/angular.module.ng.$compileProvider.directive */


var myapp = angular.module('experienceApp.directives', []);

myapp.directive('question', function () {
    return {
        restrict:'E',
        templateUrl: "../partials/pv_questionsTemplate.html"
    };
});

myapp.directive('buildquestion', function () {
    return {
        restrict: 'E',
        templateUrl: "../partials/build_questionsTemplate.html"
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


myapp.directive("flip", function () {

    function setDim(element, width, height) {
        element.style.width = width;
        element.style.height = height;
    }

    var cssString =
      "<style> \
    .flip {float: left; overflow: hidden} \
    .flipBasic { \
    position: absolute; \
    -webkit-backface-visibility: hidden; \
    backface-visibility: hidden; \
    transition: -webkit-transform .5s; \
    transition: transform .5s; \
    -webkit-transform: perspective( 800px ) rotateY( 0deg ); \
    transform: perspective( 800px ) rotateY( 0deg ); \
    } \
    .flipHideBack { \
    -webkit-transform:  perspective(800px) rotateY( 180deg ); \
    transform:  perspective(800px) rotateY( 180deg ); \
    } \
    .flipHideFront { \
    -webkit-transform:  perspective(800px) rotateY( -180deg ); \
    transform:  perspective(800px) rotateY( -180deg ); \
    } \
    </style> \
    ";

    document.head.insertAdjacentHTML("beforeend", cssString);


    return {
        restrict: "E",
        controller: function ($scope, $element, $attrs) {

            var self = this;
            self.front = null,
            self.back = null;


            function showFront() {
                self.front.removeClass("flipHideFront");
                self.back.addClass("flipHideBack");
            }

            function showBack() {
                self.back.removeClass("flipHideBack");
                self.front.addClass("flipHideFront");
            }

            self.init = function () {
                self.front.addClass("flipBasic");
                self.back.addClass("flipBasic");

                showFront();
                self.front.find('.settings.front').on("click", showBack);
                self.back.find('.settings.back').on("click", showFront);
            }

        },

        link: function (scope, element, attrs, ctrl) {

            var width = attrs.flipWidth || "100%",
              height = attrs.flipHeight || "73vh";

            element.addClass("flip");

            if (ctrl.front && ctrl.back) {
                [element, ctrl.front, ctrl.back].forEach(function (el) {
                    setDim(el[0], width, height);
                });
                ctrl.init();
            }
            else {
                console.error("FLIP: 2 panels required.");
            }

        }
    }

});

myapp.directive("flipPanel", function () {
    return {
        restrict: "E",
        require: "^flip",
        //transclusion : true,
        link: function (scope, element, attrs, flipCtr) {
            if (!flipCtr.front) { flipCtr.front = element; }
            else if (!flipCtr.back) { flipCtr.back = element; }
            else {
                console.error("FLIP: Too many panels.");
            }
        }
    }
});

myapp.directive('ngFiles', ['$parse', function ($parse) {

    function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
            onChange(scope, { $files: event.target.files, $event: event });
        });
    };

    return {
        link: fn_link
    }
}]);

myapp.directive('onLongPress', function ($timeout, $parse) {

    return {
        restrict: 'A',
        link: function ($scope, $elm, $attrs) {
            $elm.bind('touchstart', function (evt) {
                // Locally scoped variable that will keep track of the long press
                $scope.longPress = true;
                var functionHandler = $parse($attrs.onLongPress);
                // We'll set a timeout for 600 ms for a long press
                $timeout(function () {
                    if ($scope.longPress) {
                        // If the touchend event hasn't fired,
                        // apply the function given in on the element's on-long-press attribute
                        $scope.$apply(function () {
                            functionHandler($scope, { $event: evt });
                        });
                    }
                }, 600);
            });

            $elm.bind('touchend', function (evt) {
                // Prevent the onLongPress event from firing
                $scope.longPress = false;
                var functionHandler = $parse($attrs.onTouchEnd);
                // If there is an on-touch-end function attached to this element, apply it
                if ($attrs.onTouchEnd) {
                    $scope.$apply(function () {
                        functionHandler($scope, { $event: evt });
                    });
                }
            });
        }
    };
});