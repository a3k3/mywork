var KeyCodes = {
    BACKSPACE: 8,
    TABKEY: 9,
    RETURNKEY: 13,
    ESCAPE: 27,
    SPACEBAR: 32,
    LEFTARROW: 37,
    UPARROW: 38,
    RIGHTARROW: 39,
    DOWNARROW: 40,
};


/* App Controllers */

var myapp = angular.module('experienceApp.controllers', []);

function questionsCtrl($scope, getAllQuestions, $timeout, $location, $document) {
    var vm = this;

    vm.formData = {};

    $scope.questionsObj = {
        questions: [],
        maxCount: function () {
            return this.questions.length;
        },
        minCount: 0,
        activeNow: 0,
        percentComplete: function () {
            return (this.activeNow / this.maxCount()) * 100;
        }
    };

    getAllQuestions.then(function (response) {

        //for utility to work
        if ($location.search().session == "true") {
            $scope.questionsObj.questions = JSON.parse($location.search().questionobj);
            $scope.action = $location.search().actionurl;
        }
        else {
            if (sessionStorage.questionsObj != undefined) {
                $scope.questionsObj.questions = JSON.parse(sessionStorage.questionsObj);
            }
            else {
                $scope.questionsObj.questions = response.data;
            }
        }
        $scope.questionsObj.activeNow = 1;
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    $scope.$on('questionsData', function (event, data) {
        $scope.questionsObj.questions =  data;
    });

    $scope.dynamicTemplateUrl = function (data) {
        return "../partials/input_templates/" + getTemplate(data) + ".html"
    }

    $scope.onSwipeDown = function (ev) {
        $scope.questionsObj.next();
    };
    $scope.onSwipeUp = function (ev) {
        $scope.questionsObj.prev();
    };

    //next button click
    $scope.questionsObj.next = function () {
        var _active = document.getElementsByClassName("active");
        _active = angular.element(_active);
        if (_active.index() < $scope.questionsObj.maxCount()) {
            _active.removeClass('active').addClass('visited').next().addClass('active').removeClass('next_active').next().addClass('next_active').removeClass('next_next_active').next().addClass('next_next_active');
            $scope.questionsObj.activeNow++;
        }
    }

    //prev button click
    $scope.questionsObj.prev = function () {
        var _active = document.getElementsByClassName("active");
        _active = angular.element(_active);
        if (_active.index() > 1) {
            _active.removeClass('active').addClass('next_active').prev().addClass('active').removeClass('next_active').removeClass('visited');
            _active.next().removeClass('next_active').addClass('next_next_active');
            _active.next().next().removeClass('next_next_active')
            $scope.questionsObj.activeNow--;
        }
    }

    $scope.sizeSelection = function (index) {
        var _active = document.getElementById('radio-' + index);
        _active = angular.element(_active);
        _active.parent().addClass('active').siblings().removeClass('active');
        _active.attr('checked', true);
        _active.parent().siblings().find('input').attr('checked', false);
    }

    $scope.starSelection = function (index) {
        var _active = document.getElementById(index);
        _active = angular.element(_active);
        _active.parent('.ng-scope').addClass('activestar').siblings().removeClass('activestar');
        $timeout(function () {
            $scope.questionsObj.next();
        }, 1000);
    }

    $scope.smileySelection = function (event) {
        var _active = $(event.target).parent();
        _active.find('.smiley').addClass("activeSmiley");
        _active.find('input').attr('checked', true);
        _active.siblings().find(".smiley").removeClass("activeSmiley");
        _active.siblings().find('input').attr('checked', false);
        $timeout(function () {
            $scope.questionsObj.next();
        }, 1000);
    }

    $scope.keypress = function ($event) {
        var clicked = $event.target;
        if ($event.keyCode == 13) {
            $scope.questionsObj.next();
        }
    }

    $document.bind("keydown", function (event) {
        if (event.keyCode == KeyCodes.DOWNARROW) {
            //$scope.questionsObj.next();
            angular.element('.next').trigger('click')
        }
        if (event.keyCode == KeyCodes.UPARROW) {
            //$scope.questionsObj.prev();
            angular.element('.prev').trigger('click')
        }
    });
}

myapp.controller('questionsCtrl', ['$scope', 'getAllQuestions', '$timeout', '$location','$document', questionsCtrl])


function MyCtrl2() {
}

myapp.controller('MyCtrl2', ['$scope', 'getAllQuestions', MyCtrl2])

var getTemplate = function (data) {
    var input_template = "";
    if (data.answertype != null && data.answertype != "") {
        input_template = data.answertype.toLowerCase();
        if (data.answertheme != null && data.answertheme != "")
            input_template = input_template + "_" + data.answertheme.toLowerCase();
    }
    else {
        input_template = "text";
    }
    return input_template;
}

myapp.controller('successCtrl', ['$scope', function ($scope) {
    $scope.theme = "mytheme";
}]);


myapp.controller('tabCtrl', function ($scope) {
});

myapp.controller('buildCtrl', function ($scope, $document, $rootScope, $mdDialog) {

    $scope.buildQuestionsObj = {
        questions: [],
        maxCount: function () {
            return this.questions.length;
        },
        minCount: 0,
        activeNow: 0,
        percentComplete: function () {
            return (this.activeNow / this.maxCount()) * 100;
        }
    };

    //add slide
    $scope.addSlide = function () {
        var tempQuestion = {
            "id":$scope.buildQuestionsObj.maxCount()+1,
            "question": "What is your name?",
            "name": "name",
            "modelname": "name",
            "caption": "Will not share your name to anyone",
            "answertype": "text",
            "answertheme": "",
            "hint": "Type your name",
            "placeholder": "Enter your name",
            "validations": {
                "required": {
                    "condition": false,
                    "text": "Thats required!"
                },
                "maxlength": {
                    "condition": 10,
                    "text": "Thats too long!"
                },
                "minlength": {
                    "condition": 0,
                    "text": "Thats too short!"
                },
                "autocomplete": {
                    "condition": false,
                    "text": "Thats required!"
                }
            }
        };
        $scope.buildQuestionsObj.questions.push(tempQuestion);
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        $rootScope.$broadcast('questionsData', $scope.buildQuestionsObj.questions);
    };

    //delete slide
    $scope.deleteSlide = function (event) {
        var _currentSlide = $(event.target).closest('.flip').index();
        $scope.buildQuestionsObj.questions.splice(_currentSlide, 1);
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
    };

    //copy slide
    $scope.copySlide = function (event) {
        var _currentSlide = $(event.target).closest('.flip').index();
        var copyObj = angular.copy($scope.buildQuestionsObj.questions[_currentSlide]);
        $scope.buildQuestionsObj.questions.push(copyObj);
        $scope.buildQuestionsObj.questions[$scope.buildQuestionsObj.maxCount() - 1].id = $scope.buildQuestionsObj.maxCount();
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        resetSlide();
    };

    //show slide
    $scope.showSlide = function (event) {
        var _currentSlide = $(event.target).closest('md-card').index();
        resetSlide();
        setActiveSlide(_currentSlide);
        $scope.buildQuestionsObj.activeNow = _currentSlide;
    };

    //next button click
    $scope.buildQuestionsObj.next = function () {
        var _active = document.getElementsByClassName("slideactive");
        _active = angular.element(_active);
        if (_active.index() < $scope.buildQuestionsObj.maxCount()-1) {
            _active.next().addClass('slideactive').removeClass('slideleft').prev().removeClass('slideactive').addClass('slideleft');
            $scope.buildQuestionsObj.activeNow++;
        }
    }

    //prev button click
    $scope.buildQuestionsObj.prev = function () {
        var _active = document.getElementsByClassName("slideactive");
        _active = angular.element(_active);
        if (_active.index() > 0) {
            _active.removeClass('slideactive');
            _active.prev().addClass('slideactive').removeClass('slideleft');
            $scope.buildQuestionsObj.activeNow--;
        }
    }

    $document.bind("keydown", function (event) {
        if (event.keyCode == KeyCodes.LEFTARROW) {
            $scope.buildQuestionsObj.prev();
        }
        if (event.keyCode == KeyCodes.RIGHTARROW) {
            $scope.buildQuestionsObj.next();
        }
    });

    $scope.dynamicTemplateUrl = function (data) {
        return "../partials/input_templates/" + getTemplate(data) + ".html"
    }

    //question type modal
    $scope.openTypeModal = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: '../partials/questionType.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function () {
            $scope.status = 'You said the information was.';
        }, function () {
            $scope.status = 'You cancelled the dialog.';
        });
    };

    function DialogController($scope, $mdDialog) {
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }

    function resetSlide() {
        angular.element('.apply-questions-container').find('.flip').removeClass('slideactive');
        angular.element('.navigation-slide').find('md-card').removeClass('slideactive');
    }

    function setActiveSlide(index) {
        angular.element('.apply-questions-container').find('.flip').eq(index - 1).addClass('slideactive').removeClass('slideleft');
        for (var i = 0; i < index - 1; i++) {
            angular.element('.apply-questions-container').find('.flip').eq(i).addClass('slideleft')
        }
        angular.element('.navigation-slide').find('md-card').eq(index).addClass('slideactive').removeClass('slideleft');
    }
});