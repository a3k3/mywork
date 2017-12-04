
/* App Controllers */

var myapp = angular.module('experienceApp.controllers', []);

function questionsCtrl($scope, getAllQuestions, $timeout) {
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
        if (sessionStorage.questionsObj != undefined) {
            $scope.questionsObj.questions = JSON.parse(sessionStorage.questionsObj);
        }
        else {
            $scope.questionsObj.questions = response.data;
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
        var _active = $(event.target);
        _active.addClass("activeSmiley").parent().siblings().find("div").removeClass("activeSmiley");
        $timeout(function () {
            $scope.questionsObj.next();
        }, 1000);
    }
}
//questionsCtrl.$inject = ['$scope', 'getAllQuestions'];

myapp.controller('questionsCtrl', ['$scope', 'getAllQuestions', '$timeout', questionsCtrl])


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