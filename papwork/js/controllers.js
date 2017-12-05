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
    $scope.panes = [
    { title: "Home", content: "/cover", active: true },
    { title: "Settings", content: "/create" },
    { title: "View", content: "/success" }
    ];
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

    $scope.dataArray = [
      {
          src: 'https://www.travelexcellence.com/images/movil/La_Paz_Waterfall.jpg'
      },
      {
          src: 'http://www.parasholidays.in/blog/wp-content/uploads/2014/05/holiday-tour-packages-for-usa.jpg'
      },
      {
          src: 'http://clickker.in/wp-content/uploads/2016/03/new-zealand-fy-8-1-Copy.jpg'
      },
      {
          src: 'http://images.kuoni.co.uk/73/indonesia-34834203-1451484722-ImageGalleryLightbox.jpg'
      },
      {
          src: 'http://www.holidaysaga.com/wp-content/uploads/2014/09/Day08-SIN-day-Free-City-View.jpg'
      },
      {
          src: 'http://images.kuoni.co.uk/73/malaysia-21747826-1446726337-ImageGalleryLightbox.jpg'
      },
      {
          src: 'http://www.kimcambodiadriver.com/uploads/images/tours/kim-cambodia-driver-angkor-wat.jpg'
      },
      {
          src: 'https://www.travcoa.com/sites/default/files/styles/flexslider_full/public/tours/images/imperialvietnam-halong-bay-14214576.jpg?itok=O-q1yr5_'
      }
    ];
})