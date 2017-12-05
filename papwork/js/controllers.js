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
        maxCount: 0,
        minCount: 0,
        activeNow: 0,
        percentComplete: function () {
            return (this.activeNow / this.maxCount) * 100;
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
        $scope.questionsObj.maxCount = $scope.questionsObj.questions.length;
    }, function myError(response) {
        $scope.status = response.statusText;
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
        if (_active.index() < $scope.questionsObj.maxCount) {
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
        if (event.keyCode == 40) {
            //$scope.questionsObj.next();
            angular.element('.next').trigger('click')
        }
        if (event.keyCode == 38) {
            //$scope.questionsObj.prev();
            angular.element('.prev').trigger('click')
        }
    });
}
//questionsCtrl.$inject = ['$scope', 'getAllQuestions'];

myapp.controller('questionsCtrl', ['$scope', 'getAllQuestions', '$timeout', '$location','$document', questionsCtrl])


function MyCtrl2() {
}
//MyCtrl2.$inject = [];

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

myapp.controller('buildCtrl', function ($scope) {
    $scope.buildQuestionsObj = {
        questions: [],
        maxCount: 0,
        minCount: 0,
        activeNow: 0,
        percentComplete: function () {
            return (this.activeNow / this.maxCount) * 100;
        }
    };

    $scope.addSlide = function () {
        var tempQuestion = {
            "id": $scope.minCount++,
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
                    "condition": true,
                    "text": "Thats required!"
                },
                "maxlength": {
                    "condition": 10,
                    "text": "Thats too long!"
                },
                "minlength": {
                    "condition": 0,
                    "text": "Thats too short!"
                }
            }
        };
        $scope.buildQuestionsObj.questions.push(tempQuestion);
    };
});