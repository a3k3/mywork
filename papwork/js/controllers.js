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


function CarouselController($timeout, $attrs, $interval, $window) {

    var that = this;
    that.currentIndex = 0;
    that.currentMarginLeftValue = 0;
    that.radioButtonIndex = 0;
    that.transitionsTime = 500;
    that.transitionsEnabled = true;

    $attrs.$observe('data', function () {
        that.onDataChange();
    });

    that.registerElement = function (element) {
        that.element = element;
        that.elementParent = that.element.parent();
        that.slidesContainer = angular.element(that.element.find('div')[0]);
        $window.addEventListener('resize', function () {
            that.updateSlidesContainerWidth();
        });
    };

    that.onDataChange = function () {
        if (that.isDataInvalidOrTooSmall()) {
            return;
        }
        that.executeCloneData();
        $timeout(function () {
            that.updateSlidesContainerWidth();
            that.restartFromFirstItem();
        });
    };

    that.updateSlidesContainerWidth = function () {
        that.scaleContent();
        that.currentWidth = that.element.prop('offsetWidth');
        that.currentHeight = that.element.prop('offsetHeight');
        that.resizeSlides();
        var newSlidesContainerWidth = that.currentWidth * that.cloneData.length;
        that.slidesContainer.css('width', newSlidesContainerWidth + 'px');
        that.scaleMarginLeft(newSlidesContainerWidth);
        that.currentSlidesContainerWidth = newSlidesContainerWidth;
    };

    that.scaleContent = function () {
        that.maxWidth = that.maxWidth ? parseInt(that.maxWidth) : 0;
        if (that.maxWidth === 0) {
            that.maxWidth = that.element.prop('offsetWidth');
        }
        that.maxHeight = that.maxHeight ? parseInt(that.maxHeight) : 0;
        if (that.maxHeight === 0) {
            that.maxHeight = that.element.prop('offsetHeight');
        }
        var currentElementParentWidth = that.elementParent.prop('offsetWidth');
        if (currentElementParentWidth < that.maxWidth) {
            console.log(currentElementParentWidth, that.maxWidth);
            var newHeight = (that.maxHeight * currentElementParentWidth) / that.maxWidth;
            that.element.css('width', currentElementParentWidth + 'px');
            that.element.css('height', newHeight + 'px');
        } else if (currentElementParentWidth >= that.maxWidth) {
            that.element.css('width', that.maxWidth + 'px');
            that.element.css('height', that.maxHeight + 'px');
        }
    };

    that.resizeSlides = function () {
        var slides = $window.document.getElementsByClassName('slide');
        for (var index = 0; index < slides.length; index++) {
            var slide = angular.element(slides[index]);
            slide.css('width', that.currentWidth + 'px');
            slide.css('height', that.currentHeight + 'px');
        }
    };

    that.scaleMarginLeft = function (newSlidesContainerWidth) {
        if (
          that.currentSlidesContainerWidth &&
          that.currentSlidesContainerWidth !== newSlidesContainerWidth
        ) {
            that.currentMarginLeftValue = that.currentMarginLeftValue * newSlidesContainerWidth;
            that.currentMarginLeftValue = that.currentMarginLeftValue / that.currentSlidesContainerWidth;
            that.disableTransitions();
            that.applyMarginLeft();
            that.enableTransitions();
        }
    };

    that.restartFromFirstItem = function () {
        if (!that.currentWidth) {
            return;
        }
        that.disableTransitions();
        that.currentMarginLeftValue = that.currentWidth * -1;
        that.applyMarginLeft();
        that.currentIndex = 0;
        that.radioButtonIndex = that.currentIndex;
        that.enableTransitions();
    };

    that.executeCloneData = function () {
        var cloneArray = [];
        for (var index = 0; index < that.data.length; index++) {
            var item = that.data[index];
            cloneArray.push(item);
        }
        that.cloneFirstItem(cloneArray);
        that.cloneLastItem(cloneArray);
        that.cloneData = cloneArray;
    };

    that.cloneFirstItem = function (cloneArray) {
        var firstItem = cloneArray[0];
        var firstItemClone = angular.copy(firstItem);
        cloneArray.push(firstItemClone);
    };

    that.cloneLastItem = function (cloneArray) {
        var lastItem = cloneArray[that.data.length - 1];
        var lastItemClone = angular.copy(lastItem);
        cloneArray.unshift(lastItemClone);
    };

    that.validateAutoSlide = function () {
        if (!that.autoSlide) {
            that.stopAutoSlide();
        } else {
            that.startAutoSlide();
        }
    };

    that.restartAutoSlide = function () {
        if (!that.autoSlide) {
            return;
        }
        if (that.transitionsEnabled) {
            $timeout(function () {
                that.stopAutoSlide();
                that.startAutoSlide();
            }, that.transitionsTime);
        } else {
            that.stopAutoSlide();
            that.startAutoSlide();
        }
    };

    that.startAutoSlide = function () {
        if (!angular.isDefined(that.autoSlideInterval)) {
            that.autoSlideInterval = $interval(function () {
                that.navigateRight();
            }, that.autoSlideTime);
        }
    };

    that.stopAutoSlide = function () {
        if (angular.isDefined(that.autoSlideInterval)) {
            $interval.cancel(that.autoSlideInterval);
            that.autoSlideInterval = undefined;
        }
    };

    that.onNavigateLeft = function () {
        that.navigateLeft();
        that.restartAutoSlide();
    };

    that.navigateLeft = function () {
        if (that.isDataInvalidOrTooSmall()) {
            return;
        }
        that.currentIndex--;
        that.radioButtonIndex = that.currentIndex;
        that.currentMarginLeftValue += that.currentWidth;
        that.applyMarginLeft();
        that.restartAutoSlide();
        if (that.currentIndex === -1) {
            that.restartFromLastItem();
        }
    };

    that.restartFromLastItem = function () {
        $timeout(function () {
            that.disableTransitions();
            that.currentMarginLeftValue = (that.currentWidth * that.data.length) * -1;
            that.applyMarginLeft();
            that.currentIndex = that.data.length - 1;
            that.radioButtonIndex = that.currentIndex;
            that.enableTransitions();
        }, that.transitionsTime);
    };

    that.onNavigateRight = function () {
        that.navigateRight();
        that.restartAutoSlide();
    };

    that.navigateRight = function () {
        if (that.isDataInvalidOrTooSmall()) {
            return;
        }
        that.currentIndex++;
        that.radioButtonIndex = that.currentIndex;
        that.currentMarginLeftValue -= that.currentWidth;
        that.applyMarginLeft();
        that.restartAutoSlide();
        if (that.currentIndex === that.data.length) {
            $timeout(function () {
                that.restartFromFirstItem();
            }, that.transitionsTime);
        }
    };

    that.applyMarginLeft = function () {
        that.slidesContainer.css('margin-left', that.currentMarginLeftValue + 'px');
    };

    that.disableTransitions = function () {
        that.slidesContainer.css('transition', 'none');
        that.transitionsEnabled = false;
    };

    that.enableTransitions = function () {
        $timeout(function () {
            that.slidesContainer.css('transition', 'margin 0.5s ease-in-out');
            that.transitionsEnabled = true;
        }, 200);
    };

    that.onRadioButtonClick = function () {
        var multiplier;
        if (that.radioButtonIndex > that.currentIndex) {
            multiplier = that.radioButtonIndex - that.currentIndex;
            that.currentMarginLeftValue -= (that.currentWidth * multiplier);
        } else {
            multiplier = that.currentIndex - that.radioButtonIndex;
            that.currentMarginLeftValue += (that.currentWidth * multiplier);
        }
        that.currentIndex = that.radioButtonIndex;
        that.applyMarginLeft();
        that.restartAutoSlide();
    };

    that.isDataInvalidOrTooSmall = function () {
        if (!that.data || that.data.length === 0) {
            return true;
        }
        return false;
    };
}

myapp.controller('mdCarouselController', [
    '$timeout', '$attrs', '$interval', '$window',
    CarouselController
  ]);