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

function questionsCtrl($scope, getAllQuestions, $timeout, $location, $document, $rootScope) {

    $rootScope.bodylayout = 'experience-layout';

    var vm = this;

    $scope.formData = {};

    $scope.questionsObj = {
        name: "Untitled",
        id: null,
        theme: "default",
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

        $timeout(function () {
            if (angular.element('.top-row').length > 0) {
                angular.element('.top-row').css('width', (angular.element('.top-row').find('.products').length * angular.element('.top-row').find('.products').outerWidth(true)) / 2)
            }
        }, 1000)
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    $scope.$on('questionsFormTheme', function (event, data) {
        $scope.questionsObj.theme = data;
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

    $scope.dropdownSelection = function (selectvalue, options) {
        $.each(options, function (index, value) {
            if (value.value == selectvalue)
                value.selected = true;
            else
                value.selected = false;
        })
    }

    $scope.sizeSelection = function (index, event, options) {
        var _active = $(event.target).hasClass('size') ? $(event.target) : $(event.target).parent();
        _active.addClass('active').siblings().removeClass('active');
        $.each(options, function (index, value) {
            value.selected = false;
        })
        options[index].selected = true;
    }

    $scope.starSelection = function (index, event, options) {
        var _active = $(event.target);
        _active.parent('.ng-scope').addClass('activestar').siblings().removeClass('activestar');

        $.each(options, function (index, value) {
            value.selected = false;
        })
        options[index].selected = true;

        $timeout(function () {
            $scope.questionsObj.next();
        }, 1000);
    }

    $scope.selectProduct = function (index, event, options) {
        var _clicked = $(event.target).hasClass('products') ? $(event.target) : $(event.target).parent();
        _clicked.toggleClass('active');
        if (_clicked.hasClass('active')) {
            _clicked.find('.checkbox').attr('checked', true);
            options[index].selected = true;
        }
        else {
            _clicked.find('.checkbox').attr('checked', false);
            options[index].selected = false;
        }
    }

    $scope.smileySelection = function (index, event, options) {
        var _active = $(event.target).parent();
        _active.find('.smiley').addClass("activeSmiley");
        _active.find('.smiley_radio').attr('checked', true);
        _active.siblings().find(".smiley").removeClass("activeSmiley");
        _active.siblings().find('.smiley_radio').attr('checked', false);
        $.each(options,function (index, value) {
            value.selected = false;
        })
        options[index].selected = true;
        $timeout(function () {
            $scope.questionsObj.next();
        }, 1000);
    }

    $scope.checkboxSelection = function (index, event, options) {
        var _active = $(event.target).hasClass('mdcheckbox') ? $(event.target) : $(event.target).closest('.mdcheckbox');
        if (_active.hasClass('md-checked')) {
            options[index].selected = false;
        }
        else {
            options[index].selected = true;
        }
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

    $scope.submit = function () {
        console.log($scope.questionsObj.questions);
    }
}

myapp.controller('questionsCtrl', ['$scope', 'getAllQuestions', '$timeout', '$location', '$document', '$rootScope', questionsCtrl])


function MyCtrl2() {
}

myapp.controller('MyCtrl2', ['$scope', 'getAllQuestions', MyCtrl2])

var getTemplate = function (data) {
    var input_template = "";
    if (data != undefined) {
        if (data.answertype != null && data.answertype != "") {
            input_template = data.answertype.toLowerCase();
            if (data.answertheme != null && data.answertheme != "")
                input_template = input_template + "_" + data.answertheme.toLowerCase();
        }
    }
    else {
        input_template = "text";
    }
    return input_template;
}

myapp.controller('successCtrl', function ($scope, getSuccessData, $rootScope) {

    $rootScope.bodylayout = 'success-layout';

    $scope.theme = "mytheme";

    getSuccessData.then(function (success) {
        $scope.successdata = success.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    });
});

myapp.controller('tabCtrl', function ($scope, $rootScope) {
    $scope.themes = ['default','green', 'black', 'pink','blue','yellow', 'orange'];

    $scope.changeTheme = function (event) {
        var theme = $(event.target).data('theme');
        $rootScope.$broadcast('questionsFormTheme', theme);
    }

    $scope.projectname = "Untitled";
});

myapp.controller('buildCtrl', function ($scope, $document, $rootScope, $mdDialog, $compile, getSettings, getCoverData, getSuccessData, $http, $timeout) {

    $rootScope.bodylayout = 'create-layout';

    $scope.buildQuestionsObj = {
        name: "Untitled",
        id: null,
        theme: "default",
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

    $scope.$parent.$watch('projectname', function (value) {
        $scope.buildQuestionsObj.name = value;
    });

    getCoverData.then(function (cover) {
        $scope.buildcoverdata = cover.data;
        $rootScope.$broadcast('coverData', $scope.buildcoverdata);
        //settings
        getSettings.then(function (response) {
            $scope.buildcoverdata.settings = response.data.cover.settings;
            if ($scope.buildcoverdata.settings.covertemplate.condition) {
                $scope.buildcoverdata.cover_template = 'official';
            }
            else {
                $scope.buildcoverdata.cover_template = 'default';
            }
        })
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    getSuccessData.then(function (success) {
        $scope.buildsuccessdata = success.data;
        $rootScope.$broadcast('successData', $scope.buildsuccessdata);
        //settings
        getSettings.then(function (response) {
            $scope.buildsuccessdata.settings = response.data.success.settings;
            if ($scope.buildsuccessdata.settings.successtemplate.condition) {
                $scope.buildsuccessdata.success_template = 'official';
            }
            else {
                $scope.buildsuccessdata.success_template = 'default';
            }
        })
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    //add slide
    $scope.addSlide = function () {
        var tempQuestion = {
            "id":$scope.buildQuestionsObj.maxCount()+1,
        };
        $scope.buildQuestionsObj.questions.push(tempQuestion);
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        $rootScope.$broadcast('questionsData', $scope.buildQuestionsObj.questions);

        resetSlide();
        setActiveSlide($scope.buildQuestionsObj.maxCount());
        angular.element('.apply-questions-container').find('.flip:last-child').removeClass('slideactive');
        angular.element('.navigating_blocks').find('md-card:last-child').removeClass('slideactive');
        //$('.navigating_blocks md-card').outerWidth(true);

        if ($('.navigating_blocks md-card').length>4){
            $(".navigating_blocks").animate({
                marginLeft: '-=54px'
            }, 500);
        }

        $timeout(function () {
            angular.element('.apply-questions-container').find('.flip').eq($scope.buildQuestionsObj.maxCount()).find('.type button').trigger('click');
        }, 3000);
    };

    //add question
    $scope.addQuestion = function (type) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var id = $scope.buildQuestionsObj.questions[index].id;
        $scope.buildQuestionsObj.questions[index] = {
            "id": id,
            "question": "Please edit this text?",
            "category": "Category",
            "caption": "Add a suitable caption",
            "hint": "Please add your hint here",
            "placeholder": "Placeholder text",
        };
        $scope.buildQuestionsObj.questions[index].answertype = (type[0] != undefined ? type[0] : "text");
        $scope.buildQuestionsObj.questions[index].answertheme = (type[1] != undefined ? type[1] : "");
        var tmplhtml = $compile('<ng-include src="dynamicTemplateUrl(question)"></ng-include>')($scope);
        angular.element('.apply-questions-container').find('.flip').eq(index).find('.inputContainer').append(tmplhtml);
        //angular.element('.apply-questions-container').find('.flip').find('.type').addClass(type[0].toLowerCase());
        $scope.buildQuestionsObj.questions[index].questiontype = type[0];
        if (type[1] != undefined)
        {
            $scope.buildQuestionsObj.questions[index].questiontype = $scope.buildQuestionsObj.questions[index].questiontype + '_' + type[1];
        }

        //settings
        getSettings.then(function (response) {
            var type = "";
            if($scope.buildQuestionsObj.questions[index].answertype != ""){
                type = $scope.buildQuestionsObj.questions[index].answertype
                if($scope.buildQuestionsObj.questions[index].answertheme != "")
                    type = type + '_' +$scope.buildQuestionsObj.questions[index].answertheme;
            }
            var typedata = response.data[type];
            //add validations 
            $scope.buildQuestionsObj.questions[index].validations = typedata.settings;

            //add options if exist
            if (typedata.options) {
                $scope.buildQuestionsObj.questions[index].options = typedata.options;
            }
            else {
                $scope.buildQuestionsObj.questions[index].options = [];
            }
        }, function myError(response) {
            $scope.status = response.statusText;
        });

    }

    //set settings panel
    $scope.getSettingUrl = function (tmpl) {
        return '../partials/settings_templates/'+tmpl+'.html'
    }

    //add options
    $scope.addOption = function(event){
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var copyObj = angular.copy($scope.buildQuestionsObj.questions[index].options[0]);
        $scope.buildQuestionsObj.questions[index].options.push(copyObj);
    }

    //delete options
    $scope.deleteOption = function (event) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var deleteIndex = $(event.target).closest('.option').index();
        $scope.buildQuestionsObj.questions[index].options.splice(deleteIndex, 1);
    }

    //delete slide
    $scope.deleteSlide = function (event) {
        var _currentSlide = $(event.target).closest('.flip').index();
        $scope.buildQuestionsObj.questions.splice(_currentSlide-1, 1);
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
    };

    //copy slide
    $scope.copySlide = function (event) {
        var _currentSlide = $(event.target).closest('.flip').index();
        var copyObj = angular.copy($scope.buildQuestionsObj.questions[_currentSlide-1]);
        $scope.buildQuestionsObj.questions.push(copyObj);
        $scope.buildQuestionsObj.questions[$scope.buildQuestionsObj.maxCount() - 1].id = $scope.buildQuestionsObj.maxCount();
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        resetSlide();
    };

    //show slide
    $scope.showSlide = function (event) {
        event.stopPropagation();
        var _currentSlide = $(event.target).closest('md-card').index();
        resetSlide();
        setActiveSlide(_currentSlide);
        if (_currentSlide <= $scope.buildQuestionsObj.maxCount() && $scope.buildQuestionsObj.maxCount() > 0)
        $scope.buildQuestionsObj.activeNow = _currentSlide;
    };

    //next button click
    $scope.buildQuestionsObj.next = function () {
        var _active = document.getElementsByClassName("slideactive");
        _active = angular.element(_active);
        if (_active.index() <= $scope.buildQuestionsObj.maxCount()) {
            _active.next().addClass('slideactive').removeClass('slideleft').prev().removeClass('slideactive').addClass('slideleft');
            if ($scope.buildQuestionsObj.activeNow <= $scope.buildQuestionsObj.maxCount())
                $scope.buildQuestionsObj.activeNow++;
        }
        if ($('.navigating_blocks .slideactive').offset().left > 220 && $('.navigating_blocks .slideactive').offset().left < 230 && $('.navigating_blocks .slideactive').nextAll().length >0) {
            $(".navigating_blocks").animate({
                marginLeft: '-=54px'
            }, 500);
        }
    }

    //prev button click
    $scope.buildQuestionsObj.prev = function () {
        var _active = document.getElementsByClassName("slideactive");
        _active = angular.element(_active);
        if (_active.index() > 0) {
            _active.removeClass('slideactive');
            _active.prev().addClass('slideactive').removeClass('slideleft');
            if ($scope.buildQuestionsObj.activeNow > 1)
                $scope.buildQuestionsObj.activeNow--;
        }
        if ($('.navigating_blocks .slideactive').offset().left < 15 && $('.navigating_blocks .slideactive').prevAll().length) {
            $(".navigating_blocks").animate({
                marginLeft: '+=54px'
            }, 500);
        }
    }

    $document.bind("keydown", function (event) {
        if (event.keyCode == KeyCodes.LEFTARROW && $(event.target).closest('.apply-questions-container').length == 0) {
            $scope.buildQuestionsObj.prev();
        }
        if (event.keyCode == KeyCodes.RIGHTARROW && $(event.target).closest('.apply-questions-container').length == 0) {
            $scope.buildQuestionsObj.next();
        }
    });

    $scope.dynamicTemplateUrl = function (data) {
        if (data == undefined)
            return;
        return "../partials/build_input_templates/" + getTemplate(data) + ".html"
    }

    //question type modal
    $scope.openTypeModal = function (ev) {
        $mdDialog.show({
            locals:{
                callback: $scope.addQuestion
            },
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

    $scope.nextswipes = function () {
        //alert();
    }

    function DialogController($scope, $mdDialog, callback) {
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.addQuestion = function (event) {
            angular.element('.content > .flex').removeClass('active');
            $(event.target).data('type') == undefined ? $(event.target).parent().addClass('active') : $(event.target).addClass('active');
            var type = $(event.target).data('type') == undefined ? $(event.target).parent().data('type').split('_') : $(event.target).data('type').split('_');
            callback(type);
            $scope.cancel();
        }
    }

    function resetSlide() {
        angular.element('.apply-questions-container').find('.flip').removeClass('slideactive');
        angular.element('.navigation-slide').find('md-card').removeClass('slideactive');
    }

    function setActiveSlide(index) {
        angular.element('.apply-questions-container').find('.flip').eq(index).addClass('slideactive').removeClass('slideleft');
        for (var i = 0; i < index; i++) {
            angular.element('.apply-questions-container').find('.flip').eq(i).addClass('slideleft')
        }
        for (var i = index+1; i <= $scope.buildQuestionsObj.maxCount()+1; i++) {
            angular.element('.apply-questions-container').find('.flip').eq(i).removeClass('slideleft')
        }
        angular.element('.navigating_blocks md-card').eq(index).addClass('slideactive').removeClass('slideleft');
        for (var i = 0; i < index; i++) {
            angular.element('.navigating_blocks md-card').find('.flip').eq(i).addClass('slideleft')
        }
        for (var i = index + 1; i <= $scope.buildQuestionsObj.maxCount() + 1; i++) {
            angular.element('.navigating_blocks md-card').find('.flip').eq(i).removeClass('slideleft')
        }
    }

    var formdata = new FormData();

    $scope.updateMedia = function (event) {
        var fileBrowse = $(event.target).data('file') == undefined? $(event.target).parent().data('file') : $(event.target).data('file');
        document.getElementById(fileBrowse).click();
    }

    $scope.getTheFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            formdata.append(key, value);
        });
        var reader = new FileReader();
        reader.onload = function (loadEvent) {
            $scope.$apply(function () {
                $scope.buildcoverdata.default.media_src = loadEvent.target.result;
            });
        }
        reader.readAsDataURL($files[0]);
        $scope.uploadFiles();
    };

    // NOW UPLOAD THE FILES.
    $scope.uploadFiles = function () {
        var request = {
            method: 'POST',
            url: 'http://www.leisureguard-rebrand.insureplc.co.uk/get-quote',
            data: formdata,
            headers: {
                'Content-Type': undefined
            }
        };

        // SEND THE FILES.
        $http(request)
            .success(function (d) {
                alert(d);
            })
            .error(function () {
            });

    }

    //draggable
    $scope.onDropComplete = function (index, obj, evt) {
        var otherObj = $scope.buildQuestionsObj.questions[index];
        var otherIndex = $scope.buildQuestionsObj.questions.indexOf(obj);
        $scope.buildQuestionsObj.questions[index] = obj;
        $scope.buildQuestionsObj.questions[otherIndex] = otherObj;
    }
    //draggable
});

myapp.controller('coverCtrl', function ($scope, getCoverData, $http, $rootScope) {

    $rootScope.bodylayout = 'cover-layout';

    getCoverData.then(function (cover) {
        $scope.coverdata = cover.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    $scope.$on('coverData', function (event, data) {
        $scope.coverdata = data;
    });

    $scope.gotoExperience = function (url) {
        window.location = url;
    }
});













//$(document).ready(function (e) {
//    $('.navigating_blocks').mousedown(function (e) {
//        var cursorX = e.pageX;
//        $('#mouseX').text('mouse x: ' + cursorX);
//    });
//    $('.navigating_blocks').draggable(
//    {
//        drag: function () {
//            var offset = $(this).offset();
//            var xPos = offset.left;
//            $('#posX').text('drag x: ' + xPos);
//        }
//    });

//});

//$(".navigating_blocks").swipe(function (direction, offset) {
//    console.log("Moving", direction.x, "and", direction.y);
//    console.log("Touch moved by", offset.x, "horizontally and", offset.y, "vertically");
//});
