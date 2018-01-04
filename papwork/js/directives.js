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

myapp.directive('ngTouchstart', [function () {
    return function (scope, element, attr) {

        element.on('touchstart', function (event) {
            scope.$apply(function () {
                scope.$eval(attr.myTouchstart);
            });
        });
    };
}]);

myapp.directive('ngTouchend', [function () {
    return function (scope, element, attr) {

        element.on('touchend', function (event) {
            scope.$apply(function () {
                scope.$eval(attr.myTouchend);
            });
        });
    };
}]);

myapp.directive('webcam', function () {
    return {
        template: '<div class="webcam" ng-transclude></div>',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope:
        {
            onError: '&',
            onStream: '&',
            onStreaming: '&',
            placeholder: '=',
            config: '=channel'
        },
        link: function postLink($scope, element) {
            var videoElem = null,
                videoStream = null,
                placeholder = null;

            $scope.config = $scope.config || {};

            var _removeDOMElement = function _removeDOMElement(DOMel) {
                if (DOMel) {
                    angular.element(DOMel).remove();
                }
            };

            var onDestroy = function onDestroy() {
                if (!!videoStream) {
                    var checker = typeof videoStream.getVideoTracks === 'function';
                    if (videoStream.getVideoTracks && checker) {
                        // get video track to call stop in it
                        // videoStream.stop() is deprecated and may be removed in the
                        // near future
                        // ENSURE THIS IS CHECKED FIRST BEFORE THE FALLBACK
                        // videoStream.stop()
                        var tracks = videoStream.getVideoTracks();
                        if (tracks && tracks[0] && tracks[0].stop) {
                            tracks[0].stop();
                        }
                    } else if (videoStream.stop) {
                        // deprecated, may be removed in the near future
                        videoStream.stop();
                    }
                }
                if (!!videoElem) {
                    delete videoElem.src;
                }
            };

            // called when camera stream is loaded
            var onSuccess = function onSuccess(stream) {
                videoStream = stream;

                // Firefox supports a src object
                if (navigator.mozGetUserMedia) {
                    videoElem.mozSrcObject = stream;
                } else {
                    var vendorURL = window.URL || window.webkitURL;
                    videoElem.src = vendorURL.createObjectURL(stream);
                }

                /* Start playing the video to show the stream from the webcam */
                videoElem.muted = true;
                videoElem.play();
                $scope.config.video = videoElem;

                /* Call custom callback */
                if ($scope.onStream) {
                    $scope.onStream({ stream: stream });
                }
            };

            // called when any error happens
            var onFailure = function onFailure(err) {
                _removeDOMElement(placeholder);
                if (console && console.log) {
                    console.log('The following error occured: ', err);
                }

                /* Call custom callback */
                if ($scope.onError) {
                    $scope.onError({ err: err });
                }

                return;
            };

            var startWebcam = function startWebcam() {
                videoElem = document.createElement('video');
                videoElem.setAttribute('class', 'webcam-live');
                videoElem.setAttribute('autoplay', '');
                element.append(videoElem);

                if ($scope.placeholder) {
                    placeholder = document.createElement('img');
                    placeholder.setAttribute('class', 'webcam-loader');
                    placeholder.src = $scope.placeholder;
                    element.append(placeholder);
                }

                // Default variables
                var isStreaming = false,
                  width = element.width = $scope.config.videoWidth || 320,
                  height = element.height = 0;

                // Check the availability of getUserMedia across supported browsers
                if (!window.hasUserMedia()) {
                    onFailure({ code: -1, msg: 'Browser does not support getUserMedia.' });
                    return;
                }

                var mediaConstraint = { video: true, audio: true };
                navigator.getMedia(mediaConstraint, onSuccess, onFailure);

                /* Start streaming the webcam data when the video element can play
                 * It will do it only once
                 */
                videoElem.addEventListener('canplay', function () {
                    if (!isStreaming) {
                        var scale = width / videoElem.videoWidth;
                        height = (videoElem.videoHeight * scale) ||
                                  $scope.config.videoHeight;
                        videoElem.setAttribute('width', width);
                        videoElem.setAttribute('height', height);
                        //videoElem.setAttribute('controls', "controls");
                        //videoElem.setAttribute('muted', "muted");
                        isStreaming = true;

                        $scope.config.video = videoElem;

                        _removeDOMElement(placeholder);

                        /* Call custom callback */
                        if ($scope.onStreaming) {
                            $scope.onStreaming();
                        }
                    }
                }, false);
            };

            var stopWebcam = function stopWebcam() {
                _removeDOMElement(placeholder);
                onDestroy();
                videoElem.remove();
            };
            var options;
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                options = { mimeType: 'video/webm; codecs=vp9' };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                options = { mimeType: 'video/webm; codecs=vp8' };
            } else {
                // ...
            }
            var recordedChunks = [], media;

            var startRec = function startRec() {
                var recVid = document.getElementById("playRecVid"), recStr;

                if (videoElem.captureStream) {
                    recStr = videoElem.captureStream();
                    var vendorURL = window.URL || window.webkitURL;
                    //recVid.src = vendorURL.createObjectURL(recStr);                      
                } else if (videoElem.mozCaptureStream) {
                    recStr = videoElem.mozCaptureStream();
                    //recVid.mozSrcObject = recStr;                     
                } else {
                    console.log("stream not supported");
                }
                media = new MediaRecorder(recStr, options);
                media.ondataavailable = function (event) {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    } else {
                        console.log("No data Available");
                    }
                }
                media.start();
                //recVid.play();
            }

            var stopRec = function stopRec() {
                if (media != undefined) {
                    media.stop();
                } else {
                    console.log("media not defined");
                }
            }

            var downloadRec = function downloadRec() {
                var blob = new Blob(recordedChunks, {
                    type: 'video/webm'
                });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                document.body.appendChild(a);
                a.style = 'display: none';
                a.href = url;
                a.download = 'test.webm';
                a.click();
                window.URL.revokeObjectURL(url);
            }

            $scope.$on('$destroy', onDestroy);
            $scope.$on('START_WEBCAM', startWebcam);
            $scope.$on('STOP_WEBCAM', stopWebcam);
            $scope.$on('START_RECORD', startRec);
            $scope.$on('STOP_RECORD', stopRec);
            $scope.$on('DOWNLOAD_RECORD', downloadRec);

            //startWebcam();

        }
    };
});