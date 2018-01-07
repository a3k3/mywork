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

var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

function htmlDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    // handle case of empty input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

function getSafeRanges(dangerous) {
    var a = dangerous.commonAncestorContainer;
    // Starts -- Work inward from the start, selecting the largest safe range
    var s = new Array(0), rs = new Array(0);
    if (dangerous.startContainer != a)
        for (var i = dangerous.startContainer; i != a; i = i.parentNode)
            s.push(i)
    ;
    if (0 < s.length) for (var i = 0; i < s.length; i++) {
        var xs = document.createRange();
        if (i) {
            xs.setStartAfter(s[i - 1]);
            xs.setEndAfter(s[i].lastChild);
        }
        else {
            xs.setStart(s[i], dangerous.startOffset);
            xs.setEndAfter(
                (s[i].nodeType == Node.TEXT_NODE)
                ? s[i] : s[i].lastChild
            );
        }
        rs.push(xs);
    }

    // Ends -- basically the same code reversed
    var e = new Array(0), re = new Array(0);
    if (dangerous.endContainer != a)
        for (var i = dangerous.endContainer; i != a; i = i.parentNode)
            e.push(i)
    ;
    if (0 < e.length) for (var i = 0; i < e.length; i++) {
        var xe = document.createRange();
        if (i) {
            xe.setStartBefore(e[i].firstChild);
            xe.setEndBefore(e[i - 1]);
        }
        else {
            xe.setStartBefore(
                (e[i].nodeType == Node.TEXT_NODE)
                ? e[i] : e[i].firstChild
            );
            xe.setEnd(e[i], dangerous.endOffset);
        }
        re.unshift(xe);
    }

    // Middle -- the uncaptured middle
    if ((0 < s.length) && (0 < e.length)) {
        var xm = document.createRange();
        xm.setStartAfter(s[s.length - 1]);
        xm.setEndBefore(e[e.length - 1]);
    }
    else {
        return [dangerous];
    }

    // Concat
    rs.push(xm);
    response = rs.concat(re);

    // Send to Console
    return response;
}

function highlightRange(range) {
    if (range.startOffset < range.endOffset) {
        var newNode = document.createElement("span");
        newNode.setAttribute(
           "class",
           "action-word"
        );
        range.surroundContents(newNode);
    }
}

function disableRange(range) {
    if (range.startOffset < range.endOffset) {
        console.log("hiiii");
    }
}

/* App Controllers */

var myapp = angular.module('experienceApp.controllers', []);

function questionsCtrl($scope, getAllQuestions, $timeout, $location, $document, $rootScope, $http, $interval) {

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
                angular.forEach($scope.questionsObj.questions, function (value, index) {
                    value.question = htmlDecode(value.question);
                    value.caption = htmlDecode(value.caption);
                    value.hint = htmlDecode(value.hint);
                    value.placeholder = htmlDecode(value.placeholder);
                });
            }
        }
        $scope.questionsObj.activeNow = 1;

        $scope.checkIfTimed();

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

    $scope.onSwipeDown = function () {
        $scope.questionsObj.prev();
    };

    $scope.onSwipeUp = function () {
        $scope.questionsObj.next();
    };

    //next button click
    $scope.questionsObj.next = function () {
        var _active = document.getElementsByClassName("active");
        _active = angular.element(_active);
        if (_active.index() < $scope.questionsObj.maxCount()) {
            _active.removeClass('active').addClass('visited').next().addClass('active').removeClass('next_active').next().addClass('next_active').removeClass('next_next_active').next().addClass('next_next_active');
            var autocomplete = $scope.questionsObj.questions[$scope.questionsObj.activeNow - 1].validations.autocomplete;
            if (autocomplete != undefined && autocomplete.start > 0) {
                $interval.cancel($scope.questionsObj.questions[$scope.questionsObj.activeNow - 1].validations.autocomplete.interval);
            }
            $scope.questionsObj.activeNow++;
            $scope.checkIfTimed();
        }
    }

    $scope.checkIfTimed = function () {
        var index = $scope.questionsObj.activeNow - 1;
        var _autocomplete = $scope.questionsObj.questions[index].validations.autocomplete;
        if (_autocomplete != undefined && _autocomplete.condition) {
            if (_autocomplete.start > 0) return;
            _autocomplete.start = 0;
            _autocomplete.seconds = '0s';
            _autocomplete.interval = $interval(function () {
                _autocomplete.start += 1;
                _autocomplete.seconds = parseInt(_autocomplete.start / ( 100/_autocomplete.time))+ 's';
                if (_autocomplete.start >= 100) {
                    $scope.questionsObj.next();
                    $interval.cancel(_autocomplete.interval);
                }
            }, _autocomplete.time*10);

            //$timeout(function () {
            //    $scope.questionsObj.next();
            //}, _autocomplete.time * 1000)
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

    $scope.getTheFiles = function ($files, element) {
        var reader = new FileReader();
        reader.onload = function (loadEvent) {
            $scope.$apply(function () {
                element.response = loadEvent.target.result;
                var data = loadEvent.target.result.substr(loadEvent.target.result.indexOf(",") + 1, loadEvent.target.result.length);
                $scope.uploadFiles(data, function (output) {
                    element.response = output;
                });
            });
        }
        reader.readAsDataURL($files[0]);
    };

    $scope.uploadFiles = function (data, handleData) {
        uploadData.uploadImage(data).success(function (response) {
            handleData(response.data.link);
        })
        .error(function (error) {
            console.log(error);
        });
    };

    /*******Web Cam Functions********/
    $scope.myChannel = {
        videoHeight: 800,
        videoWidth: 600,
        video: null
    };
    $scope.stopCam = function () {
        $rootScope.$broadcast("STOP_WEBCAM");
    }
    $scope.startCam = function () {
        $rootScope.$broadcast("START_WEBCAM");
    }
    $scope.record = function () {
        $rootScope.$broadcast("START_RECORD");
    }
    $scope.stopRecord = function () {
        $rootScope.$broadcast("STOP_RECORD");
    }
    $scope.downloadRecord = function () {
        $rootScope.$broadcast("DOWNLOAD_RECORD");
    }
    /*******Web Cam Functions********/

    $scope.submit = function () {
        console.log($scope.questionsObj.questions);
    }
}

myapp.controller('questionsCtrl', ['$scope', 'getAllQuestions', '$timeout', '$location', '$document', '$rootScope', '$http', '$interval', questionsCtrl])


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

myapp.controller('tabCtrl', function ($scope, $rootScope, $mdDialog) {

    $rootScope.bodylayout = 'create-layout';

    $scope.themes = ['default','green', 'black', 'pink','blue','yellow', 'orange'];

    $scope.changeTheme = function (event) {
        var theme = $(event.target).data('theme');
        $rootScope.$broadcast('questionsFormTheme', theme);
    }

    function DialogController($scope, $mdDialog, callback) {
        $scope.query = { primary: true };
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    }

    $scope.PublishPopup = function (event) {
        $mdDialog.show({
            locals: {
                callback: $scope.addQuestion
            },
            controller: DialogController,
            templateUrl: '../partials/PublishPopup.html',
            parent: $(event.target).closest('body'),
            targetEvent: event,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function () {
                $scope.status = 'You said the information was.';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    }



    $scope.projectName = "My PapForm";

    $rootScope.previewURL = "../partials/cover.html";

    $scope.gotoExperience = function () {
        $rootScope.previewURL = "../partials/experience.html";
    }

    $scope.getPartial = function () {
        return $rootScope.previewURL;
    }
});

myapp.controller('buildCtrl', function ($scope, $document, $rootScope, $mdDialog, $compile, getSettings, getCoverData, getSuccessData, $http, $timeout, getSampleQuestionData, uploadData, $mdBottomSheet) {
    var sampleQuestion = {};

    getSampleQuestionData.then(function (response) {
        sampleQuestion = response.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    });

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

    $scope.$parent.$watch('previewurl', function (value) {
        $rootScope.$broadcast('questionsData', $scope.buildQuestionsObj.questions);
    });

    $scope.$on('questionsFormTheme', function (event, data) {
        $scope.buildQuestionsObj.theme = data;
    });

    getCoverData.then(function (cover) {
        $scope.buildcoverdata = cover.data;
        $rootScope.$broadcast('coverData', $scope.buildcoverdata);
        //settings
        getSettings.then(function (response) {
            $scope.buildcoverdata.settings = response.data.cover.settings;
            //$scope.buildcoverdata.advsettings = response.data.cover.advsettings;
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
            //$scope.buildsuccessdata.advsettings = response.data.success.advsettings;
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

        var slidewidth = angular.element('.navigating_blocks md-card').outerWidth(true);
        if ($('.navigating_blocks md-card').length>4){
            $(".navigating_blocks").animate({
                marginLeft: '-='+slidewidth+'px'
            }, 500);
        }

        $timeout(function () {
            angular.element('.apply-questions-container').find('.flip').eq($scope.buildQuestionsObj.maxCount()).find('.type button').trigger('click');
            angular.element('.navigating_blocks').css('width', slidewidth * angular.element('.navigating_blocks md-card').length);
        }, 0);
    };

    //add question
    $scope.addQuestion = function (type, qtype) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var id = $scope.buildQuestionsObj.questions[index].id;
        $scope.buildQuestionsObj.questions[index] = angular.copy(sampleQuestion.dummyQuestion);
        if (qtype != null) {
            $scope.buildQuestionsObj.questions[index] = angular.copy(sampleQuestion[qtype]);
        }
        $scope.buildQuestionsObj.questions[index].id = id
        $scope.buildQuestionsObj.questions[index].draggable = false;
        $scope.buildQuestionsObj.questions[index].answertype = (type[0] != undefined ? type[0] : "text");
        $scope.buildQuestionsObj.questions[index].answertheme = (type[1] != undefined ? type[1] : "");
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

            //add advanced validations 
            $scope.buildQuestionsObj.questions[index].advancedvalidations = typedata.advsettings;

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

        $timeout(function () {
            setActiveSlide(id);
        }, 0);
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

    //add advance setting show/hide option
    $scope.addAdvanceOption = function (event,type) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var questionTemp = $scope.buildQuestionsObj.questions[index].advancedvalidations[type];
        var copyObj = angular.copy(questionTemp.logic_options[0]);
        questionTemp.logic_options.push(copyObj);
    }

    $scope.updateAdvanceAnswers = function (logic) {
        var index = logic.slide_to_show - 1;
        if ($scope.buildQuestionsObj.questions[index].options.length > 0){
            logic.answer_list = $scope.buildQuestionsObj.questions[index].options;
        }
        else {
            logic.type = "static";
        }
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

        $timeout(function () {
            resetSlide();
            setActiveSlide($scope.buildQuestionsObj.activeNow);
            var slidewidth = angular.element('.navigating_blocks md-card').outerWidth(true);
            angular.element('.navigating_blocks').css('width', slidewidth * angular.element('.navigating_blocks md-card').length);
        }, 0);
    };

    //copy slide
    $scope.copySlide = function (event) {
        var _currentSlide = $(event.target).closest('.flip').index();
        var copyObj = angular.copy($scope.buildQuestionsObj.questions[_currentSlide-1]);
        $scope.buildQuestionsObj.questions.push(copyObj);
        $scope.buildQuestionsObj.questions[$scope.buildQuestionsObj.maxCount() - 1].id = $scope.buildQuestionsObj.maxCount();
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        resetSlide();

        $timeout(function () {
            var slidewidth = angular.element('.navigating_blocks md-card').outerWidth(true);
            angular.element('.navigating_blocks').css('width', slidewidth * angular.element('.navigating_blocks md-card').length);
        }, 0);
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
            parent: $(ev.target).closest('.apply-questions-container'),
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

    function DialogController($scope, $mdDialog, callback) {
        $scope.query = { primary: true };
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.addQuestion = function (event,samplequestion) {
            var type = $(event.target).data('type') == undefined ? $(event.target).parent().data('type').split('_') : $(event.target).data('type').split('_');
            if (type[0] != "more" && type[0] != "less") {
                angular.element('.content > .flex').removeClass('active');
                $(event.target).data('type') == undefined ? $(event.target).parent().addClass('active') : $(event.target).addClass('active');
                callback(type, samplequestion);
                $scope.cancel();
            }
            else {
                if (type[0] == "more") {
                    $scope.query = {};
                    angular.element('.content [data-type="more"]').hide()
                    angular.element('.content [data-type="less"]').show();
                }
                else {
                    $scope.query = { primary: true };
                    angular.element('.content [data-type="less"]').hide();
                    angular.element('.content [data-type="more"]').show();
                }
            }
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

    $scope.getTheFiles = function ($files, element) {
        angular.forEach($files, function (value, key) {
            formdata.append(key, value);
        });

        var reader = new FileReader();
        reader.onload = function (loadEvent) {
            $scope.$apply(function () {
                element.media_src = loadEvent.target.result;
                var data = loadEvent.target.result.substr(loadEvent.target.result.indexOf(",") + 1, loadEvent.target.result.length);
                $scope.uploadFiles(data, function (output) {
                    element.media_src = output;
                });
            });
        }
        reader.readAsDataURL($files[0]);
    };

    //UPLOAD THE FILES.
    $scope.uploadFiles = function (data, handleData) {
        uploadData.uploadImage(data).success(function (response) {
            handleData(response.data.link);
        })
        .error(function (error) {
            console.log(error);
        });
    }

    //draggable
    $scope.onDropComplete = function (index, obj, evt) {
        var otherObj = $scope.buildQuestionsObj.questions[index];
        var otherIndex = $scope.buildQuestionsObj.questions.indexOf(obj);
        $scope.buildQuestionsObj.questions[index] = obj;
        $scope.buildQuestionsObj.questions[otherIndex] = otherObj;

        //set draggable false
        $scope.buildQuestionsObj.questions[index].draggable = false;
        $scope.buildQuestionsObj.questions[otherIndex].draggable = false;

        //set element id
        $scope.buildQuestionsObj.questions[otherIndex].id = otherIndex + 1
        $scope.buildQuestionsObj.questions[index].id = index + 1;

        resetSlide();
        setActiveSlide(index + 1);

        //set scroll back
        angular.element('.navigation-slide').css('overflow-x', 'scroll');
    }

    //ng-drag-move=
    $scope.dragContainer = function (ev) {
        var scrollPostion = $('.navigation-slide').scrollLeft();
        if (ev.tx > 0) {
            $('.navigation-slide').scrollLeft(scrollPostion + 1);
        }
        else {
            $('.navigation-slide').scrollLeft(scrollPostion - 1);
        }
    }
    //draggable

    $scope.itemOnLongPress = function (event, question) {
        question.draggable = true;
        angular.element('.navigation-slide').css('overflow-x','hidden')
    }

    $scope.onSwipeLeft = function () {
        var index = angular.element('.apply-questions-container').find('.flip.slideactive').index();
        var containerLength = angular.element('.apply-questions-container').find('.flip').length-1;
        index  = index == containerLength ? index : index + 1;
        resetSlide();
        setActiveSlide(index);
    }

    $scope.onSwipeRight = function () {
        var index = angular.element('.apply-questions-container').find('.flip.slideactive').index();
        index = index == 0 ? index : index - 1;
        resetSlide();
        setActiveSlide(index);
    }

    $scope.userSelection = "";

    $scope.highlightSelection = function(event) {
        $scope.userSelection = window.getSelection().getRangeAt(0);
        if ($scope.userSelection.startOffset < $scope.userSelection.endOffset) {
            angular.element('ul.tools').css({
                'left': event.pageX + 5,
                'top': event.pageY - 100
            }).fadeIn(200);
        } else {
            angular.element('ul.tools').fadeOut(200);
        }
    }

    $scope.addActionWord = function () {
        var safeRanges = getSafeRanges($scope.userSelection);
        for (var i = 0; i < safeRanges.length; i++) {
            highlightRange(safeRanges[i]);
        }
        angular.element('ul.tools').fadeOut(200);
    }

    $scope.removeActionWord = function () {
        var safeRanges = getSafeRanges($scope.userSelection);
        for (var i = 0; i < safeRanges.length; i++) {
            disableRange(safeRanges[i]);
        }
        angular.element('ul.tools').fadeOut(200);
    }

    $scope.showListBottomSheet = function (event, option) {
        $mdBottomSheet.show({
            templateUrl: '../partials/settings_templates/media_bottomsheet.html',
            controller: 'ListBottomSheetCtrl',
            locals: {
                event: event,
                option: option
            }
        }).then(function (clickedItem) {
            
        }).catch(function (error) {
            // User clicked outside or hit escape
        });
    };
});

myapp.controller('coverCtrl', function ($scope, getCoverData, $http, $rootScope, $controller) {

    $rootScope.bodylayout = 'cover-layout';

    getCoverData.then(function (cover) {
        $scope.coverdata = cover.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    $scope.$on('coverData', function (event, data) {
        $scope.coverdata = data;
    });

    angular.extend(this, $controller('tabCtrl', { $scope: $scope }));
    //extend the scope
    var superclass = angular.extend({}, $scope);

    $scope.gotoExperience = function (url, event) {
        if ($(event.target).closest('.create-tabs').length > 0) {
            //var ngInclude = $(event.target).closest('.cover-page').parent();
            //ngInclude.attr('ng-include', '../partials/experience.html');

            if (superclass.gotoExperience) {
                superclass.gotoExperience();
            }
        }
        else {
            window.location = url;
        }
    }
});

myapp.controller('typeLayoutCtrl', function ($scope, getFieldTypeData) {

    getFieldTypeData.then(function (fieldtype) {
        $scope.fieldtypedata = fieldtype.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    });
});

myapp.controller('responsectrl', function ($scope) {   
    $scope.responseid = "Response ID: 345hfgdgxf";
    $scope.totaltable = {
        "row1": {
            "col1": "Response ID",
            "col2": "Whats your name?",
            "col3":"Whats your age?"
        },
        "row2": {
            "col1": "abd23ndjnd",
            "col2": "Amit Shaw",
            "col3": 35
        },
        "row3": {
            "col1": "abd23ndjnd",
            "col2": "Sumit Shaw",
            "col3": 27
        }
    };

    $scope.reviewer1 = {
        "1": {
            "1": "Reviewer#1"
        },
        "2": {
            "1": "Question1<br/>answer"
        },
        "3": {
            "1": "Question2<br/>answer"
        },
        "4": {
            "1": "Question3<br/>answer"
        }
    };
    $scope.reviewer2 = {
        "1": {
            "1": "Reviewer#2"
        },
        "2": {
            "1": "Question1<br/>answer"
        },
        "3": {
            "1": "Question2<br/>answer"
        },
        "4": {
            "1": "Question3<br/>answer"
        }
    };
    $scope.qblock1 = {
        "1": {
            "Q": "Whats your name?",
            "A": "Amit Kumar Shaw"
        },
        "2": {
            "Q": "Whats your age?",
            "A": 35
        },
        "3": {
            "Q": "What language do you speak?",
            "A": "Hindi"
        },
        "4": {
            "Q": "What is your fathers name?",
            "A": "XYZ Shaw"
        },
        "5": {
            "Q": "Which location you prefer for job?",
            "A": "Hyderabad"
        },
        "6": {
            "Q": "Which location you prefer for job?",
            "A": "Hyderabad"
        }
    };
    $scope.qblock2 = {
        "1": {
            "Q": "Whats your name?",
            "A": "Amit Kumar Shaw"
        },
        "2": {
            "Q": "Whats your age?",
            "A": 35
        },
        "3": {
            "Q": "What language do you speak?",
            "A": "Hindi"
        },
        "4": {
            "Q": "What is your fathers name?",
            "A": "XYZ Shaw"
        },
        "5": {
            "Q": "Which location you prefer for job?",
            "A": "Hyderabad"
        },
        "6": {
            "Q": "Which location you prefer for job?",
            "A": "Hyderabad"
        }
    }
});
myapp.controller('ListBottomSheetCtrl', function ($scope, $mdBottomSheet, event, option) {

    $scope.items = [
      { name: 'Link', icon: '../asset/img/md-icons/svg/ic_link_black_24px.svg', type:'link', src:'' },
      { name: 'Use Gallery', icon: '../asset/img/md-icons/svg/ic_photo_library_black_24px.svg', type: 'gallery', src:'' },
      { name: 'Use Camera', icon: '../asset/img/md-icons/svg/ic_add_a_photo_black_24px.svg', type:'camera', src:'' }
    ];

    $scope.listItemClick = function ($index) {
        var clickedItem = $scope.items[$index];
        if (clickedItem['type'] == "gallery")
            $scope.updateMedia(event);
        if (clickedItem['type'] == "link")
            $scope.updateLink(event, option, clickedItem);
        $mdBottomSheet.hide(clickedItem);
    };

    //UPLOAD THE FILES.
    $scope.updateMedia = function (event) {
        var fileBrowse = $(event.target).data('file') == undefined ? $(event.target).parent().data('file') : $(event.target).data('file');
        document.getElementById(fileBrowse).click();
    }

    $scope.getTheFiles = function ($files, element) {
        angular.forEach($files, function (value, key) {
            formdata.append(key, value);
        });

        var reader = new FileReader();
        reader.onload = function (loadEvent) {
            $scope.$apply(function () {
                element.media_src = loadEvent.target.result;
                var data = loadEvent.target.result.substr(loadEvent.target.result.indexOf(",") + 1, loadEvent.target.result.length);
                $scope.uploadFiles(data, function (output) {
                    element.media_src = output;
                });
            });
        }
        reader.readAsDataURL($files[0]);
    };

    $scope.uploadFiles = function (data, handleData) {
        uploadData.uploadImage(data).success(function (response) {
            handleData(response.data.link);
        })
        .error(function (error) {
            console.log(error);
        });
    }

    //using external url
    $scope.updateLink = function (event, element, clickedItem) {
        element.media_src = clickedItem['src'];
    }
})
