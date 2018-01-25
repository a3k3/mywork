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

var tempQuestionObj = {};

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

// -> Fisher–Yates shuffle algorithm
function shuffleArray(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

// Find first ancestor of el with tagName
// or undefined if not found
function upTo(el, tagName) {
    tagName = tagName.toLowerCase();

    while (el && el.parentNode) {
        el = el.parentNode;
        if (el.tagName && el.tagName.toLowerCase() == tagName) {
            return el;
        }
    }

    // Many DOM methods return null if they don't 
    // find the element they are searching for
    // It would be OK to omit the following and just
    // return undefined
    return null;
}

function getCaretPosition(editableDiv) {
    var nodeValue = "";
    var caretPos = 0,
      sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() == editableDiv) {
            var tempEl = document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return { caretPos: caretPos, nodeValue: nodeValue };
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

function addviahtml(html) {
    //var html = this.boxHTML.val();
    //var css = this.boxCSS.val();
    //var js = this.boxJS.val();

    //convert to input expected by our theme
    var othertypes = ['radio', 'select', 'checkbox'];
    var questions = []
    var allLabels = $(html).find("label");
    var allCaptions = $(html).find(".caption");
    var allHints = $(html).find(".hint");
    var lbl_index = 0;
    var setradioFlag = 0;
    var setradioName = "";
    $(html).find(':input').each(function (index, value) {
        if ($(this).prop("tagName").toLowerCase() == 'input' && ($(this).attr('type').toLowerCase() == 'radio' || $(this).attr('type').toLowerCase() == 'checkbox') && setradioFlag && $(this).attr('name').toLowerCase() == setradioName) {
            return true;
        }
        else {
            setradioFlag = 0;
            setradioName = "";
            if ($(this).prop("tagName").toLowerCase() == 'input' && ($(this).attr('type').toLowerCase() == 'submit' || $(this).attr('type').toLowerCase() == 'hidden')) {
            }
            else {
                var current_label = allLabels.eq(lbl_index);
                var current_caption = allCaptions.eq(lbl_index);
                var current_hint = allHints.eq(lbl_index);
                var question = {
                    "id": index + 1,
                    "question": current_label.text(),
                    "name": $(this).attr('name'),
                    "modelname": "",
                    "caption": current_caption.length == 0 ? "" : current_caption.text(),
                    "answertype": $(this).prop("tagName").toLowerCase() == 'input' ? $(this).attr('type') : $(this).prop("tagName").toLowerCase(),
                    "answertheme": "",
                    "hint": current_hint.length == 0 ? "Please see the instructions" : current_hint.text(),
                    "placeholder": $(this).attr('placeholder') != undefined ? $(this).attr('placeholder') : "Enter here",
                    "value": $(this).attr('value'),
                    "validations": {
                        "required": {
                            "condition": "true",
                            "text": "Thats required!"
                        }
                    }
                }
                question.options = [];
                if (question.answertype.toLowerCase() == "select") {
                    $(this).find('option').each(function () {
                        var option = {
                            "key": $(this).text(),
                            "value": $(this).attr('value')
                        }
                        question.options.push(option);
                    });
                }
                else if (question.answertype.toLowerCase() == "radio" || question.answertype.toLowerCase() == "checkbox") {
                    setradioFlag = 1;
                    setradioName = question.name;
                    $(this).closest('form').find('input:' + question.answertype.toLowerCase() + '[name=' + question.name + ']').each(function () {
                        var option = {
                            "key": $(this)[0].nextSibling.data,
                            "value": $(this).attr('value')
                        }
                        question.options.push(option);
                    });
                }
                else {
                    var option = {
                        "value": "",
                        "placeholder":"Enter Value"
                    }
                    question.options.push(option);
                }
                questions.push(question);
                lbl_index++
            }
        }
    });
    var action = $(html).attr('action');
    //console.log(questions);

    var result = 'http://localhost:2472/angular/#/experience';

    writeResult(result, questions);
}

function writeResult(result, questions) {
    var iframe = $('.buildpopup .preview_via iframe');
    iframe.attr('src', result);

    if (typeof (Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        sessionStorage.questionsObj = JSON.stringify(questions);
    } else {
        // Sorry! No Web Storage support..
        aler("Sorry! No Web Storage support..");
    }
}

var customhtml = "";
var names=[];

function addviatext(text) {
    //var str = "1. The ra2.in in SPAIN stays mainly in the plain?";
    //var res = str.match(/^[1-9]\.(.*)\?$/);
    //var customhtml = '<form action="/action_page.php"><label for="fname">'+res[1]+'</label><input type="text" id="fname" name="firstname" placeholder="Your name set.."> </form>';

    //addviahtml(customhtml);

    var str = $('.codeedit_via textarea').val();
    var question_sep = /\s*[1-9]\.\s*/;
    var question_List = str.split(question_sep);
    console.log(question_List);
    //var res = str.match(/^[1-9]\.(.*)\?$/);
    //var customhtml = '<form action="/action_page.php"><label for="fname">' + question_List[1] + '</label><input type="text" id="fname" name="firstname" placeholder="Your name set.."> </form>';
    //console.log(customhtml);

    var index = 1;

    //question_List[i].each(function () {
    //    alert();
    //});

    
    $.each(question_List, function (index, value) {
        
        //console.log(question_List[index]);
        //var Question_index = question_List[index].indexOf('?');
        var question_tag = question_List[index].substr(0, question_List[index].indexOf('?'));
        var input_text = question_List[index].substr(question_List[index].indexOf("?") + 1);
        //console.log(question_tag + ' --- ' + input_text);


        if (question_List[index] != "") {
            if (question_List[index].indexOf('{') == -1) {
                var question_tag = question_List[index].substr(0, question_List[index].indexOf('?'));
                var input_text = question_List[index].substr(question_List[index].indexOf("?") + 1);
                customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="text" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
                console.log(customhtml);
                names.push(customhtml);

            }
            else {
                var question_tag = question_List[index].substr(0, question_List[index].indexOf('?'));
                var input_text = question_List[index].substr(question_List[index].indexOf("}") + 1);
                var regExpne = /\{([^)]+)\}/;
                var matches = regExpne.exec(question_List[index]);
                console.log(matches[1]);
                switch (matches[1]) {
                    case "checkbox":
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="checkbox" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
                        console.log(customhtml);
                        break;
                    case "radio":
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="radio" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
                        console.log(customhtml);
                        break;
                    case "date":
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="date" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
                        console.log(customhtml);
                        break;
                    case "email":
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="email" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
                        console.log(customhtml);
                        break;
                    case "paragraph":
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label><textarea name="message" rows="10" cols="30" placeholder="Your name set.."> ' + input_text + '</textarea>';
                        console.log(customhtml);
                        break;
                }
            }
        }            
    });

    console.log(names);
    var finalhtml_text = '<form action="/action_page.php">' + names + '</form>';
    addviahtml(finalhtml_text);
}

/* App Controllers */

var myapp = angular.module('experienceApp.controllers', ['angular-toArrayFilter']);

myapp.controller('questionsCtrl', function ($scope, getAllQuestions, $timeout, $location, $document, $rootScope, $http, $interval, $filter, uploadData, $compile) {

    $rootScope.bodylayout = 'experience-layout';

    var vm = this;

    $scope.formData = {};

    $scope.questionsObj = {
        name: "Untitled",
        id: guid(),
        theme: "default",
        questions: [],
        maxCount: function () {
            return this.questions.filter(function (item) { return item.enable }).length;
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
            angular.forEach($scope.questionsObj.questions, function (value, index) {
                value.question = value.question;
                var temp = value.question;
                var tmp = document.createElement("DIV");
                tmp.innerHTML = temp;
                if (angular.element(tmp).find('span').length > 0) {
                    angular.element(tmp).find('span').each(function (index, value) {
                        if ($(value).hasClass('chip')) {
                            var answerfor = $(value).data('question-id');
                            var insertVal = $('<span ng-bind-html="questionsObj.questions[' + (answerfor - 1) + '].response"></span>');
                            $(value).replaceWith(insertVal);
                        }
                    })
                }
                value.question = tmp.innerHTML;
                //$compile(value.question)($scope);
                value.enable = true;
                if (value.validations != undefined && value.validations.internal != undefined && value.validations.internal.condition) {
                    value.enable = false;
                }

                //check for random options
                if (value.validations != undefined && value.validations.randomize != undefined && value.validations.randomize.condition) {
                    value.options = shuffleArray(value.options);
                }
            });
        }
        $scope.questionsObj.activeNow = 0;
        $scope.checkIfTimed();

        $timeout(function () {
            if (angular.element('.top-row').length > 0) {
                angular.element('.top-row').css('width', (angular.element('.top-row').find('.products').length * angular.element('.top-row').find('.products').outerWidth(true)) / 2)
            }

            if (angular.element('.question').length > 0) {
                $scope.questionsObj.activeNow = 1;
            }
        }, 1000)


    }, function myError(response) {
        $scope.status = response.statusText;
    });

    $scope.$on('questionsFormTheme', function (event, data) {
        $scope.questionsObj.theme = data;
    });

    $scope.$on('questionsData', function (event, data) {
        $scope.questionsObj.questions = data;
        angular.forEach($scope.questionsObj.questions, function (value, index) {
            value.question = value.question;
            var temp = value.question;
            var tmp = document.createElement("DIV");
            tmp.innerHTML = temp;
            if (angular.element(tmp).find('span').length > 0) {
                angular.element(tmp).find('span').each(function (index, value) {
                    if ($(value).hasClass('chip')) {
                        var answerfor = $(value).data('question-id');
                        var insertVal = $('<span ng-bind-html="questionsObj.questions[' + (answerfor - 1) + '].response"></span>');
                        $(value).replaceWith(insertVal);
                    }
                })
            }
            value.question = tmp.innerHTML;
            //$compile(value.question)($scope);
            value.enable = true;
            if (value.validations != undefined && value.validations.internal != undefined && value.validations.internal.condition) {
                value.enable = false;
            }

            //check for random options
            if (value.validations != undefined && value.validations.randomize != undefined && value.validations.randomize.condition) {
                value.options = shuffleArray(value.options);
            }
        });
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
        if (_active.find('.inputContainer input').hasClass('ng-invalid')) return;
        $timeout(function () {
            if (_active.index() >= 0 && _active.index() < $scope.questionsObj.maxCount()) {
                _active.removeClass('active').addClass('visited').next().addClass('active').removeClass('next_active').next().addClass('next_active').removeClass('next_next_active').next().addClass('next_next_active');
                var autocomplete = $scope.questionsObj.questions[$scope.questionsObj.activeNow - 1].validations.autocomplete;
                if (autocomplete != undefined && autocomplete.start > 0) {
                    $interval.cancel($scope.questionsObj.questions[$scope.questionsObj.activeNow - 1].validations.autocomplete.interval);
                }
                $scope.questionsObj.activeNow++;
                $scope.checkIfTimed();
            }
        }, 500)
    }

    $scope.checkadvancedvalidation = function () {
        var index = $scope.questionsObj.activeNow-1;
        if ($scope.questionsObj.questions[index] != undefined && $scope.questionsObj.questions[index].advancedvalidations != undefined && window.location.href.indexOf('experience') != -1) {
            var jumplogic = $scope.questionsObj.questions[index].advancedvalidations.jumplogic;
            var answer = {};
            if ($scope.questionsObj.questions[index].response != undefined && $scope.questionsObj.questions[index].response != "") {
                answer.value = $scope.questionsObj.questions[index].response;
            }
            else if ($scope.questionsObj.questions[index].options != undefined) {
                answer = $scope.questionsObj.questions[index].options.filter(function (item) {
                    if (item.selected != undefined)
                        return item.selected == true
                    else
                        return item.value != ""
                })[0];
            }
            var match = jumplogic.logic_options.filter(function (item) {
                if (answer != undefined && answer != "" && answer!= "NaN" && item.answer != undefined)
                    return item.answer.value.toLowerCase() === answer.value.toLowerCase();
            })[0];

            if (match != undefined) {
                for (var i = $scope.questionsObj.activeNow; i < match.slide_to_show - 1; i++) {
                    $scope.questionsObj.questions[i].enable = false;
                }
                for (var i = match.slide_to_show; i < $scope.questionsObj.maxCount() ; i++) {
                    $scope.questionsObj.questions[i].enable = true;
                }
                $scope.changeslideorder = true;
            }
            else {
                for (var i = $scope.questionsObj.activeNow; i < $scope.questionsObj.maxCount() ; i++) {
                    $scope.questionsObj.questions[i].enable = true;
                }
                $scope.changeslideorder = true;
            }
            $scope.changeslideArrangement();
        }
    }

    $scope.checkshowhidevalidation = function () {
        var index = $scope.questionsObj.activeNow;
        if ($scope.questionsObj.questions[index] != undefined && $scope.questionsObj.questions[index].advancedvalidations != undefined && window.location.href.indexOf('experience') != -1) {
            var showhide = $scope.questionsObj.questions[index].advancedvalidations.showhide;
            $scope.questionsObj.questions[index].enable = showhide.condition;
            var _condition = true;
            angular.forEach(showhide.logic_options, function (option, i) {
                var _question = $scope.questionsObj.questions.filter(function (item) {
                    return item.id = option.questionno;
                })[0];

                var answer = {};
                if (_question.response != undefined && _question.response != "") {
                    answer.value = _question.response;
                }
                else if (_question.options != undefined) {
                    answer = _question.options.filter(function (item) {
                        if (item.selected != undefined)
                            return item.selected == true
                        else
                            return item.value != ""
                    })[0];
                }

                switch (option.operator) {
                    case "equals": if (answer.value == option.answer.value) _condition = true
                                   else _condition = false;
                        break
                    case "notequals": if (answer.value != option.answer.value) _condition = true
                                    else _condition = false;
                        break
                    default: _condition = true;
                }
            });

            if (_condition && showhide.condition)
                $scope.questionsObj.questions[index].enable = true;
            else
                $scope.questionsObj.questions[index].enable = false;

            $scope.changeslideorder = true;
            $scope.changeslideArrangement();
        }
    }

    $scope.$watch('questionsObj.questions', function (newval, oldval) {
        $scope.checkadvancedvalidation();
        $scope.checkshowhidevalidation();
        $scope.writeToResponse();
    }, true);

    $scope.writeToResponse = function () {
        var index = $scope.questionsObj.activeNow - 1;
        if (index > -1) {
            $scope.questionsObj.questions[index].response = "";
            if ($scope.questionsObj.questions[index].options != undefined) {
                var response = $scope.questionsObj.questions[index].options
                angular.forEach(response, function (value, index) {
                    if ($scope.questionsObj.questions[index] != undefined) {
                        $scope.questionsObj.questions[index].response = $scope.questionsObj.questions[index].response + value.value
                    }
                });
            }
        }
    };

    $scope.changeslideArrangement = function () {
        if ($scope.changeslideorder) {
            var _active = document.getElementsByClassName("active");
            _active = angular.element(_active);
            _active.nextAll().removeClass('next_active');
            _active.nextAll().removeClass('next_next_active');

            _active.next().addClass('next_active');
            _active.next().next().addClass('next_next_active');
            $scope.changeslideorder = false;
        }
    }

    $scope.questionsObj.nextTab = function (event) {
        angular.element(event.target).parents('ng-form').next().find('input').focus();
    }

    $scope.checkIfTimed = function () {
        var index = $scope.questionsObj.activeNow - 1;
        if (index >= 0) {
            var _autocomplete = $scope.questionsObj.questions[index].validations.autocomplete;
            if (_autocomplete != undefined && _autocomplete.condition) {
                if (_autocomplete.start > 0) return;
                _autocomplete.start = 0;
                _autocomplete.seconds = '0s';
                _autocomplete.interval = $interval(function () {
                    _autocomplete.start += 1;
                    _autocomplete.seconds = parseInt(_autocomplete.start / (100 / _autocomplete.time)) + 's';
                    if (_autocomplete.start >= 100) {
                        $scope.questionsObj.next();
                        $interval.cancel(_autocomplete.interval);
                    }
                }, _autocomplete.time * 10);

                //$timeout(function () {
                //    $scope.questionsObj.next();
                //}, _autocomplete.time * 1000)
            }
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
        $.each(options, function (index, value) {
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
                element.value = loadEvent.target.result;
                var data = loadEvent.target.result.substr(loadEvent.target.result.indexOf(",") + 1, loadEvent.target.result.length);
                $scope.uploadFiles(data, function (output) {
                    element.value = output;
                    element.name = $files[0].name;
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
    $scope.startCam = function (event) {
        $rootScope.$broadcast("START_WEBCAM");
        var start = angular.element(event.target).hasClass('start-interview') ? angular.element(event.target) : angular.element(event.target).closest('.start-interview');
        start.hide();
        start.siblings('.record').show();
    }
    $scope.record = function (event) {
        $rootScope.$broadcast("START_RECORD");
        var record = angular.element(event.target).hasClass('record') ? angular.element(event.target) : angular.element(event.target).closest('.record');
        record.hide();
        record.siblings('.stop').show();
        record.siblings('.mute').show();
    }
    $scope.stopRecord = function (event) {
        $rootScope.$broadcast("STOP_RECORD");
        $scope.stopCam();
        //$scope.downloadRecord();
        var stoprecord = angular.element(event.target).hasClass('stop') ? angular.element(event.target) : angular.element(event.target).closest('.stop');
        stoprecord.hide();
        stoprecord.siblings().hide();
        //stoprecord.after('<video src="'+url+'"></video>')
    }
    $scope.downloadRecord = function () {
        $rootScope.$broadcast("DOWNLOAD_RECORD");
    }
    /*******Web Cam Functions********/
    $scope.submit = function () {
        console.log($scope.questionsObj.questions);
    }
})

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

myapp.controller('tabCtrl', function ($scope, $rootScope, $mdDialog, $timeout) {

    $scope.child = {}

    $scope.$watch('child', function () { $scope.$evalAsync(); });

    $rootScope.bodylayout = 'create-layout';

    $scope.themes = ['default', 'green', 'black', 'pink', 'blue', 'yellow', 'orange'];

    $scope.changeTheme = function (event) {
        var theme = $(event.target).data('theme');
        $rootScope.$broadcast('questionsFormTheme', theme);
    }

    function publishController($scope, $mdDialog) {
        $scope.publish = {};
        $scope.publish.publishUrl = window.location.host.replace('create', 'cover') + '?id=' + $rootScope.formid

        $scope.publish.embedUrl = '<iframe src="' + $scope.publish.publishUrl + '" width="100%" height="100%"></iframe>';

        $scope.updatePublishIframe = function () {
            if ($scope.publish.type == "banner") {
                $scope.publish.embedUrl = '<iframe src="' + $scope.publish.publishUrl + '" width="100%" height="100%"></iframe>';
            }
            else if ($scope.publish.type == "load") {
                $scope.publish.embedUrl = '<script type="text/javascript">setTimeout(function(){ alert("load after load"); }, 3000);</script>';
            }
            else {
                $scope.publish.embedUrl = '<script type="text/javascript">setTimeout(function(){ alert("load after scroll"); }, 3000);</script>';
            }
        }
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    }

    $scope.PublishPopup = function (event) {
        $mdDialog.show({
            controller: publishController,
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

    $scope.$on('questionsData', function (event, data) {
        $scope.buildQuestionsObj = data;
    });

    $scope.onPublishTabSelect = function () {
        $rootScope.previewURL = "../partials/cover.html";

        sessionStorage.questionsObj = JSON.stringify($scope.buildQuestionsObj);
    }
});

myapp.controller('buildCtrl', function ($scope, $document, $rootScope, $mdDialog, $compile, getSettings, getCoverData, getSuccessData, $http, $timeout, getSampleQuestionData, uploadData, $mdBottomSheet) {

    $scope.$watch('buildQuestionsObj', function () {
        $rootScope.$broadcast('questionsData', $scope.buildQuestionsObj);
    });

    var sampleQuestion = {};

    getSampleQuestionData.then(function (response) {
        sampleQuestion = response.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    },true);

    $scope.buildQuestionsObj = {
        name: "Untitled",
        id: guid(),
        theme: "default",
        questions: [],
        maxCount: function () {
            return this.questions.length;
        },
        minCount: 0,
        activeNow: 0,
        percentComplete: function () {
            return (this.activeNow / this.maxCount()) * 100;
        },
        formSettings: [
            {
                name: "General",
                enable: true,
                active: true,
                template: 'generalForm',
                settings: [
                    {
                        name: "autocomplete",
                        condition: false,
                        time: 0,
                        enable:true
                    },
                    {
                        name: "status",
                        options: [
                            {
                                name: "Enable",
                                selected: false,
                                type: ''
                            },
                            {
                                name: "Disable",
                                selected: false,
                                type: ''
                            },
                            {
                                name: "Enable after certain date",
                                selected: false,
                                type: 'input_calendar'
                            },
                            {
                                name: "Disable after certain date",
                                selected: false,
                                type: 'input_calendar'
                            },
                            {
                                name: "Disable after ",
                                selected: false,
                                type:'number'
                            }
                        ],
                        enable: true
                    },
                    {
                        name: "export",
                        enable: true
                    },
                    {
                        name: "duplicate",
                        enable: true
                    },
                    {
                        name: "kiosk",
                        condition: true,
                        enable:true
                    }
                ]
            },
            {
                name: "Slide",
                enable: true,
                active: false,
                template: 'slideForm',
                settings: [
                    {
                        name: "nextquestionprompts",
                        condition: false,
                        enable: true
                    },
                    {
                        name: "questionserialno",
                        condition: false,
                        enable: true
                    },
                    {
                        name: "progressbar",
                        condition: false,
                        enable: true
                    },
                    {
                        name: "randomizequestion",
                        condition: false,
                        enable: true
                    }
                ]
            },
            {
                name: "Audience",
                enable: true,
                active: false,
                template: 'audienceForm',
            },
            {
                name: "Integrations",
                enable: true,
                active: false,
                template: 'integrationsForm',
            },
            {
                name: "Admin",
                enable: true,
                active: false,
                template: 'adminForm',
            },
            {
                name: "Share and Embed",
                enable: true,
                active: false,
                template: 'shareEmbed',
            },
            {
                name: "Email Notifications",
                enable: true,
                active: false,
                template: 'emailForm',
            },
            {
                name: "Processing",
                enable: true,
                active: false,
                template: 'processingForm',
            }
        ]
        
    };

    $rootScope.formid = $scope.buildQuestionsObj.id;

    $scope.$parent.$watch('projectname', function (value) {
        $scope.buildQuestionsObj.name = value;
    });

    $scope.$on('questionsFormTheme', function (event, data) {
        $scope.buildQuestionsObj.theme = data;
    });
    
    $scope.$on('addviaquestions', function (event, data) {
        angular.forEach(data, function (value, index) {
            value.enable = "true"; /*temporary should be removed*/
            $scope.buildQuestionsObj.questions.push(value);
        });
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
    });

    getCoverData.then(function (cover) {
        $scope.buildcoverdata = cover.data;
        $rootScope.$broadcast('coverData', $scope.buildcoverdata);
        //settings
        getSettings.then(function (response) {
            $scope.buildcoverdata.settings = response.data.cover.settings;
            //$scope.buildcoverdata.advsettings = response.data.cover.advsettings;
            $scope.buildcoverdata.defaultsettings = angular.copy($scope.buildcoverdata.settings);
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
            $scope.buildsuccessdata.defaultsettings = angular.copy($scope.buildsuccessdata.settings);
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

    $scope.resetToDefault = function (type) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        if (type == 'cover')
            $scope.buildcoverdata.settings = $scope.buildcoverdata.defaultsettings;
        else if (type == 'success')
            $scope.buildsuccessdata.settings = $scope.buildsuccessdata.defaultsettings;
        else
            $scope.buildQuestionsObj.questions[index].validations = $scope.buildQuestionsObj.questions[index].defaultsettings;
    }

    //add slide
    $scope.addSlide = function () {
        var tempQuestion = {
            "id": $scope.buildQuestionsObj.maxCount() + 1,
        };
        $scope.buildQuestionsObj.questions.push(tempQuestion);
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        $rootScope.$broadcast('questionsData', $scope.buildQuestionsObj.questions);
        tempQuestionObj = $scope.buildQuestionsObj;

        resetSlide();
        setActiveSlide($scope.buildQuestionsObj.maxCount());
        angular.element('.apply-questions-container').find('.flip:last-child').removeClass('slideactive');
        angular.element('.navigating_blocks').find('md-card:last-child').removeClass('slideactive');

        var slidewidth = angular.element('.navigating_blocks md-card').outerWidth(true);
        if ($('.navigating_blocks md-card').length > 4) {
            $(".navigating_blocks").animate({
                marginLeft: '-=' + slidewidth + 'px'
            }, 500);
        }

        $timeout(function () {
            angular.element('.apply-questions-container').find('.flip').eq($scope.buildQuestionsObj.maxCount()).find('.type button').trigger('click');
            setNavigationTrack(slidewidth);
        }, 0);
    };

    //add question
    $scope.addQuestion = function (type, qtype) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var id = $scope.buildQuestionsObj.questions[index].id;
        var tempoptions = [];
        if ($scope.buildQuestionsObj.questions[index].options != undefined && $scope.buildQuestionsObj.questions[index].options.length > 0)
            tempoptions = $scope.buildQuestionsObj.questions[index].options;
        if ($scope.buildQuestionsObj.questions[index].question == "" || $scope.buildQuestionsObj.questions[index].question == "undefined")
            $scope.buildQuestionsObj.questions[index] = angular.copy(sampleQuestion.dummyQuestion);

        if (qtype != null) {
            $scope.buildQuestionsObj.questions[index] = angular.copy(sampleQuestion[qtype]);
        }
        $scope.buildQuestionsObj.questions[index].id = id;
        $scope.buildQuestionsObj.questions[index].response = "";
        $scope.buildQuestionsObj.questions[index].draggable = false;
        $scope.buildQuestionsObj.questions[index].answertype = (type[0] != undefined ? type[0] : "text");
        $scope.buildQuestionsObj.questions[index].answertheme = (type[1] != undefined ? type[1] : "");
        $scope.buildQuestionsObj.questions[index].questiontype = type[0];
        $scope.buildQuestionsObj.questions[index].enable = true;
        if (type[1] != undefined) {
            $scope.buildQuestionsObj.questions[index].questiontype = $scope.buildQuestionsObj.questions[index].questiontype + '_' + type[1];
        }

        tempQuestionObj = $scope.buildQuestionsObj;

        //settings
        getSettings.then(function (response) {
            var type = "";
            if ($scope.buildQuestionsObj.questions[index].answertype != "") {
                type = $scope.buildQuestionsObj.questions[index].answertype
                if ($scope.buildQuestionsObj.questions[index].answertheme != "")
                    type = type + '_' + $scope.buildQuestionsObj.questions[index].answertheme;
            }
            var typedata = response.data[type];
            //add validations 
            $scope.buildQuestionsObj.questions[index].validations = angular.copy(typedata.settings);
            $scope.buildQuestionsObj.questions[index].defaultsettings = angular.copy($scope.buildQuestionsObj.questions[index].validations);
            //add advanced validations 
            $scope.buildQuestionsObj.questions[index].advancedvalidations = angular.copy(typedata.advsettings);

            //add options if exist
            if (typedata.options) {
                if (tempoptions.length > 0) {
                    $scope.buildQuestionsObj.questions[index].options = tempoptions;
                    angular.forEach($scope.buildQuestionsObj.questions[index].options, function (option, i) {
                        if (option.value == "") {
                            option.value = "Edit This";
                        }
                    })
                }
                else
                    $scope.buildQuestionsObj.questions[index].options = angular.copy(typedata.options);
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
        return '../partials/settings_templates/' + tmpl + '.html'
    }

    //add options
    $scope.addOption = function (event) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var activequestion = $scope.buildQuestionsObj.questions[index];
        var copyObj = angular.copy(activequestion.options[activequestion.options.length - 1]);
        copyObj.id += 1;
        activequestion.options.push(copyObj);
    }

    //add advance setting option
    $scope.addAdvanceOption = function (event, type) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var questionTemp = tempQuestionObj.questions[index].advancedvalidations[type];
        var copyObj = angular.copy(questionTemp.logic_options[0]);
        if (type == "jumplogic")
            copyObj.slide_to_show = 0;
        else
            copyObj.questionno = 0;
        questionTemp.logic_options.push(copyObj);
    }

    //remove advance setting option
    $scope.removeAdvanceOption = function (type, removeindex) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        var questionTemp = $scope.buildQuestionsObj.questions[index].advancedvalidations[type];
        questionTemp.logic_options.splice(removeindex, 1);
    }

    $scope.contentEdit = function (e) {       
        var keycode = e.which ? e.which : e.keyCode;
        var el = angular.element(e.target);
            if (keycode == 13) {
                if (!e.shiftKey) {
                    el.blur();
                    $timeout(function () {
                        el.closest("md-radio-button").next().triggerHandler('click');
                        $timeout(function () {
                            el.next().focus();
                        }, 500);
                    });                    
                }
            }        
    }
    $scope.updateAdvanceAnswers = function (logic) {
        var index = logic.questionno == 0 ? logic.questionno : logic.questionno - 1;
        if ($scope.buildQuestionsObj.questions[index].options != undefined && $scope.buildQuestionsObj.questions[index].options.length > 0) {
            logic.answer_list = $scope.buildQuestionsObj.questions[index].options;
        }
        else {
            logic.type = "static";
        }
    }

    $scope.updateAdvanceJumpAnswers = function (logic) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        if ($scope.buildQuestionsObj.questions[index].options != undefined && $scope.buildQuestionsObj.questions[index].options.length > 0) {
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
        var confirm = $mdDialog.confirm()
          .title('Would you like to delete this slide?')
          .textContent('Slide deletion is permanent please do this carefully')
          .ariaLabel('Delete')
          .targetEvent(event)
          .ok('Yes')
          .cancel('No');

        $mdDialog.show(confirm).then(function () {
            var _currentSlide = $(event.target).closest('.flip').index();
            $scope.buildQuestionsObj.questions.splice(_currentSlide - 1, 1);
            $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();

            $timeout(function () {
                resetSlide();
                setActiveSlide($scope.buildQuestionsObj.activeNow);
                var slidewidth = angular.element('.navigating_blocks md-card').outerWidth(true);
                setNavigationTrack(slidewidth);
            }, 0);
        }, function () {
            //nothing to do
        });
    };

    //copy slide
    $scope.copySlide = function (event) {
        var _currentSlide = $(event.target).closest('.flip').index();
        var copyObj = angular.copy($scope.buildQuestionsObj.questions[_currentSlide - 1]);
        $scope.buildQuestionsObj.questions.push(copyObj);
        $scope.buildQuestionsObj.questions[$scope.buildQuestionsObj.maxCount() - 1].id = $scope.buildQuestionsObj.maxCount();
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        resetSlide();

        $timeout(function () {
            var slidewidth = angular.element('.navigating_blocks md-card').outerWidth(true);
            setNavigationTrack(slidewidth);
        }, 0);
    };

    var setNavigationTrack = function (slidewidth) {
        var _slideLength = angular.element('.navigating_blocks > md-card').length + 1;
        //set scroll
        if (angular.element('.navigating_blocks').width() > angular.element('body').width()) {
            angular.element('.navigation-slide').css('overflow-x', 'scroll');
        } else {
            angular.element('.navigation-slide').css('overflow-x', 'hidden');
        }
        if (angular.element('body').width()<= 767) {
            angular.element('.navigating_blocks').css('width', slidewidth * _slideLength);
        }
        else {
            angular.element('.navigating_blocks').css('width', slidewidth * _slideLength + angular.element('.add-slide').offset().left + 10);
        }
    }

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
        if ($('.navigating_blocks .slideactive').offset().left > 220 && $('.navigating_blocks .slideactive').offset().left < 230 && $('.navigating_blocks .slideactive').nextAll().length > 0) {
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
            locals: {
                callback: $scope.addQuestion
            },
            controller: DialogController,
            templateUrl: '../partials/questionType.tmpl.html',
            parent: $(ev.target).closest('.flipBasic'),
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

        $scope.cancel = function (event) {
            $mdDialog.cancel();
        };

        $scope.addQuestion = function (event, samplequestion) {
            if (event != null) {
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
            else {
                callback("text", samplequestion);
            }
        }
    }

    $scope.buildpopup = function (event, template) {
        $mdDialog.show({
            locals: {
                template: template,
                buildQuestionsObj: $scope.buildQuestionsObj
            },
            controller: BuildPopupController,
            templateUrl: '../partials/buildpopup_templates/build_popup.html',
            parent: $(event.target).closest('md-tab-content'),
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

    function BuildPopupController($scope, $mdDialog, template, buildQuestionsObj, $timeout) {
        $scope.template = template;
        $scope.getTemplateUrl = function () {
            return '../partials/buildpopup_templates/'+template+'.html';
        }
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.buildQuestionsObj = buildQuestionsObj;

        /*******FormSettings********/
        $scope.formsettingtemplate = 'generalForm';

        $timeout(function () {
            angular.element('.formsettings_layout').find('ul li:first-child').trigger('click');
        }, 500)

        $scope.formSetting = function (event, template, settings) {
            $scope.formsettingtemplate = template;
            $scope.internalSettings = settings;
            angular.element(event.target).addClass('active').siblings().removeClass('active');
        }

        $scope.getFormSettingTemplateUrl = function () {
            return '../partials/buildpopup_templates/Formtemplates/' + $scope.formsettingtemplate + '.html'
        }

        $scope.getSettingUrl = function (template) {
            return '../partials/buildpopup_templates/Formtemplates/FormSettingsTemplate/' + template + '.html'
        }

        /*******FormSettings********/

        /*******Add Via Slide********/
        $scope.format = 'html';
        $scope.addvia_text = function () {
            $scope.format = 'text';
        }
        $scope.addvia_html = function () {
            $scope.format = 'html';
        }
        $scope.runpreview = function () {
            var _formdata = angular.element('.codeedit_via textarea').val();
            if ($scope.format == "html") {
                addviahtml(_formdata);
            }
            else {
                addviatext(_formdata);
            }
           
        }
        $scope.saveQuestions = function () {
            if (sessionStorage.questionsObj != undefined) {
                var tempquestions = JSON.parse(sessionStorage.questionsObj);
                $rootScope.$broadcast('addviaquestions', tempquestions);
            }
            $scope.hide();
        }
        /*******Add Via Slide********/
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
        for (var i = index + 1; i <= $scope.buildQuestionsObj.maxCount() + 1; i++) {
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

    //UPLOAD THE FILES.
    $scope.uploadFiles = function (data, handleData) {
        uploadData.uploadImage(data).success(function (response) {
            handleData(response.data.link);
        })
        .error(function (error) {
            console.log(error);
        });
    }


    //$scope.uploadFiles = function (file, handleData) {
    //    var uploadbucket = uploadDataToAWS.upload();

    //    if (file) {
    //        var params = { Key: file.name, ContentType: file.type, Body: file, ServerSideEncryption: 'AES256' };

    //        uploadbucket.putObject(params, function (err, data) {
    //            if (err) {
    //                // There Was An Error With Your S3 Config
    //                console.log(err.message);
    //                return false;
    //            }
    //            else {
    //                // Success!
    //                console.log('Upload Done');
    //                var s3_path = 'papwork/' + file.name;
    //                handleData(s3_path);
    //            }
    //        })
    //        .on('httpUploadProgress', function (progress) {
    //            // Log Progress Information
    //            console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
    //        });
    //    }
    //    else {
    //        // No File Selected
    //        alert('No File Selected');
    //    }
    //}

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
        if (event.target.className.indexOf('dragging') != -1) {
            angular.element('.navigation-slide').css('overflow-x', 'hidden');
        }
    }

    $scope.onDragStop = function (event, question) {
        question.draggable = false;
        angular.element('.navigation-slide').css('overflow-x', 'scroll');
    }

    $scope.onSwipeLeft = function () {
        if (angular.element('body').hasClass('md-dialog-is-showing') || angular.element('body').width() > 767) return
        var index = angular.element('.apply-questions-container').find('.flip.slideactive').index();
        var containerLength = angular.element('.apply-questions-container').find('.flip').length - 1;
        index = index == containerLength ? index : index + 1;
        resetSlide();
        setActiveSlide(index);
    }

    $scope.onSwipeRight = function () {
        if (angular.element('body').hasClass('md-dialog-is-showing') || angular.element('body').width() > 767) return
        var index = angular.element('.apply-questions-container').find('.flip.slideactive').index();
        index = index == 0 ? index : index - 1;
        resetSlide();
        setActiveSlide(index);
    }

    $scope.userSelection = "";

    $scope.highlightSelection = function (event) {
        $scope.userSelection = window.getSelection().getRangeAt(0);
        $scope.addActionWord();
    }

    $scope.addActionWord = function () {
        var safeRanges = getSafeRanges($scope.userSelection);
        for (var i = 0; i < safeRanges.length; i++) {
            highlightRange(safeRanges[i]);
        }
    }

    $scope.removeActionWord = function () {
        var safeRanges = getSafeRanges($scope.userSelection);
        for (var i = 0; i < safeRanges.length; i++) {
            disableRange(safeRanges[i]);
        }
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

    $scope.questionList = function () {
        var list = [];
        angular.forEach($scope.buildQuestionsObj.questions, function (value, key) {
            list.push({
                text: "Question#" + value.id,
                click: function ($itemScope, $event, modelValue, text, $li) {
                    var startindex = $itemScope.question.question.indexOf($scope.questionCursor.nodeValue);
                    var start = $itemScope.question.question.substring(startindex, startindex+$scope.questionCursor.caretPos);
                    var texttoAdd = '<span class="chip" data-question-id="' + value.id + '" contenteditable="false" readonly>Question#' + value.id + '<span class="removeChip">-</span></span>';
                    var end = $itemScope.question.question.substring(startindex + $scope.questionCursor.caretPos);
                    $($event.target).html(start + texttoAdd + end);
                    angular.element('.removeChip').on('click', function (event) {
                        angular.element(event.target).parent().remove();
                    })
                },
                hasBottomDivider: true
            })
        });
        return list;
    }

    $scope.calculatedVariableList = function () {
        var list = [];
        angular.forEach($scope.buildQuestionsObj.questions, function (value, key) {
            if (value.advancedvalidations != undefined && value.advancedvalidations.calculatedvariable != undefined && value.advancedvalidations.calculatedvariable.logic_options.length > 0)
                angular.forEach(value.advancedvalidations.calculatedvariable.logic_options, function (innervalue, innerkey) {
                    if (innervalue.name != "") {
                        list.push({
                            text: innervalue.name,
                            click: function ($itemScope, $event, modelValue, text, $li) {
                                var startindex = $itemScope.question.question.indexOf($scope.questionCursor.nodeValue);
                                var start = $itemScope.question.question.substring(startindex, startindex + $scope.questionCursor.caretPos);
                                var texttoAdd = '<span class="chip" data-question-id="' + innervalue.name + '" contenteditable="false" readonly>' + innervalue.name + '<span class="removeChip">-</span></span>';
                                var end = $itemScope.question.question.substring(startindex + $scope.questionCursor.caretPos);
                                $($event.target).html(start + texttoAdd + end);
                                angular.element('.removeChip').on('click', function (event) {
                                    angular.element(event.target).parent().remove();
                                })
                            },
                            hasBottomDivider: true
                        })
                    }
            });
        });
        return list;
    }

    $scope.menuOptions = function () {
       return [
              {
                  text: 'Highlight',
                  click: function ($itemScope, $event) {
                      $scope.highlightSelection($event)
                  },
                  hasBottomDivider: true
              },
              {
                  text: 'Insert Answer of',
                  click: function ($itemScope) { },
                  children: $scope.questionList()
              },
              {
                  text: 'Calculated Variable',
                  click: function ($itemScope) { },
                  children: $scope.calculatedVariableList()
              },
        ]
    };

    $scope.calculationCursor = {};

    $scope.questionCursor = {};

    $scope.setcursorposition = function (event) {
        $scope.calculationCursor = getCaretPosition(event.target);
    }

    $scope.setquestioncursorposition = function (event) {
        $scope.questionCursor = getCaretPosition(event.target);
    }

    $scope.addQuestionToCalculation = function (event, question) {
        var calculationbox = angular.element(event.target).closest('.calculatedvariable').find('.calculations');
        var startindex = calculationbox.html().indexOf($scope.questionCursor.nodeValue);
        var start = calculationbox.html().substring(startindex, startindex+$scope.calculationCursor);
        var texttoAdd = '<span class="chip" data-question-id=' + question.id + ' contenteditable="false" readonly>' + angular.element(event.target).text() + '<span class="removeChip">-</span></span>';
        var end = calculationbox.html().substring(startindex+$scope.calculationCursor);
        calculationbox.html(start + texttoAdd + end);
        angular.element('.removeChip').on('click', function (event) {
            angular.element(event.target).parent().remove();
        })
    }

    $scope.operation = function (event, operator) {
        var calculationbox = angular.element(event.target).closest('.calculatedvariable').find('.calculations');
        calculationbox.html(calculationbox.html() + operator);
    }

    $scope.contentEdit = function (e) {
        var keycode = e.which ? e.which : e.keyCode;
        if (keycode == 13) {
            if (!e.shiftKey) {
                $timeout(function () {
                    angular.element(e.target).closest("md-radio-button").next().triggerHandler('click');
                });
            }
        }
    }
});

myapp.controller('coverCtrl', function ($scope, getCoverData, $http, $rootScope, $controller, $interval) {

    $rootScope.bodylayout = 'cover-layout';

    getCoverData.then(function (cover) {
        if (cover.data.settings.disablecover != undefined && cover.data.settings.disablecover.condition && window.location.href.indexOf('create') == -1) {
            $scope.gotoExperience('#/experience', null);
        }
        else {
            $scope.coverdata = cover.data;
            $scope.checkIfTimed();
        }
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    $scope.$on('coverData', function (event, data) {
        $scope.coverdata = data;
        $scope.checkIfTimed();
    });

    angular.extend(this, $controller('tabCtrl', { $scope: $scope }));
    //extend the scope
    var superclass = angular.extend({}, $scope);

    $scope.gotoExperience = function (url, event) {
        if (event != null && $(event.target).closest('.create-tabs').length > 0) {
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

    $scope.checkIfTimed = function () {
        if (window.location.hash == '#/cover') {
            var _autocomplete = $scope.coverdata.settings.autocomplete;
            if (_autocomplete != undefined && _autocomplete.condition) {
                if (_autocomplete.start > 0) return;
                _autocomplete.start = 0;
                _autocomplete.seconds = '0s';
                _autocomplete.interval = $interval(function () {
                    _autocomplete.start += 1;
                    _autocomplete.seconds = parseInt(_autocomplete.start / (100 / _autocomplete.time)) + 's';
                    if (_autocomplete.start >= 100) {
                        $scope.gotoExperience('#/experience', null);
                        $interval.cancel(_autocomplete.interval);
                    }
                }, _autocomplete.time * 10);
            }
        }
    }
});

myapp.controller('typeLayoutCtrl', function ($scope, getTypeData) {

    getTypeData.then(function (typedata) {
        $scope.fieldtypedata = typedata.data.field_type;
        $scope.questiontypedata = typedata.data.question_type;
    }, function myError(response) {
        $scope.status = response.statusText;
    });
});

var table = {
    "surveyCompleted": 600,
    "surveyEngaged": 950,
    "surveyVisited":1200,
    '1':{
        "ResponseID":"345hfgqt",
        "userResponses": [
            {
                'Q': "What is your Name?",
                'A': "Amit Shaw"            
            },
            {
                'Q': "Your Age?",
                'A': "30"
            },
            {
                'Q': "Do you have Aadhar?",
                'A': "Yes"
            },
            {
                'Q': "Which language you Speak?",
                'A': "Hindi"
            },
            {
                'Q': "your Address?",
                'A': "Bangalore"
            }
        ],
        "reviewerResponses": {
            "1": { 
                  'reviewerId':"rev1",
                  'responses': [
                      {
                        'Q': "Plz answer Q1",
                        'A':"Answer1"
                      },
                      {
                        'Q': "Answer Q2",
                        'A':"Answer2"
                      },
                      {
                        'Q': "Answer Q3",
                        'A': "Answer3"
                      }
                  ]
        },
            "2": {
                'reviewerId': "rev2",
                'responses': [
                    {
                        'Q': "Plz answer Q1",
                        'A': "Answer1"
                    },
                    {
                        'Q': "Answer Q2",
                        'A': "Answer2"
                    }
                    
                ]
            }
        },
        "Action": {
            "value": "submitted",
            "state":"disabled"
        }
    },
    '2': {
        "ResponseID": "345hfgdgxf",
        "userResponses": [
            {
                'Q': "What is your Name?",
                'A': "Sumit Shaw"
            },
            {
                'Q': "Your Age?",
                'A': "34"
            },
            {
                'Q': "Do you have Aadhar?",
                'A': "No"
            },
            {
                'Q': "Which language you Speak?",
                'A': "Hindi"
            },
            {
                'Q': "your Address?",
                'A': "Hyderabad"
            }
        ],
        "reviewerResponses": {
            "1": {
                'reviewerId': "rev1",
                'responses': [
                    {
                        'Q': "Plz answer Q1",
                        'A': "Answer1"
                    },
                    {
                        'Q': "Answer Q2",
                        'A': "Answer2"
                    },
                    {
                        'Q': "Answer Q3",
                        'A': "Answer3"
                    }
                ]
            },
            "2": {
                'reviewerId': "rev2",
                'responses': [
                    {
                        'Q': "Plz answer Q1",
                        'A': "Answer1"
                    },
                    {
                        'Q': "Answer Q2",
                        'A': "Answer2"
                    }

                ]
            }
        },
        "Action": {
            "value": "Review",
            "state": "enabled"
        }
    },
    '3':{
    "ResponseID":"345hfggty",
        "userResponses": [
            {
                'Q': "What is your Name?",
                'A': "Karan Singh"
            },
            {
                'Q': "Your Age?",
                'A': "25"
            },
            {
                'Q': "Do you have Aadhar?",
                'A': "Yes"
            },
            {
                'Q': "Which language you Speak?",
                'A': "Marathi"
            },
            {
                'Q': "your Address?",
                'A': "Bangalore"
            }
        ],
    "reviewerResponses": {
        "1": {
            'reviewerId':"rev1",
                'responses': [
                    {
                        'Q': "Plz answer Q1",
                        'A': "Answer1"
                    },
                    {
                        'Q': "Answer Q2",
                        'A': "Answer2"
                    },
                    {
                        'Q': "Answer Q3",
                        'A': "Answer3"
                    }
                ]
        },
        "2": {
            'reviewerId': "rev2",
                'responses': [
                    {
                        'Q': "Plz answer Q1",
                        'A': "Answer1"
                    },
                    {
                        'Q': "Answer Q2",
                        'A': "Answer2"
                    }

                ]
        }
    },
    "Action": {
        "value": "review",
            "state":"enabled"
    }
    },
    '4': {
        "ResponseID": "345hfggtx",
        "userResponses": [
            {
                'Q': "What is your Name?",
                'A': "Arjun Reddy"
            },
            {
                'Q': "Your Age?",
                'A': "27"
            },
            {
                'Q': "Do you have Aadhar?",
                'A': "Yes"
            },
            {
                'Q': "Which language you Speak?",
                'A': "Telugu"
            },
            {
                'Q': "your Address?",
                'A': "Hyderabad"
            }
        ],
        "reviewerResponses": {
            "1": {
                'reviewerId': "rev1",
                'responses': [
                    {
                        'Q': "Plz answer Q1",
                        'A': "Answer1"
                    },
                    {
                        'Q': "Answer Q2",
                        'A': "Answer2"
                    },
                    {
                        'Q': "Answer Q3",
                        'A': "Answer3"
                    }
                ]
            },
            "2": {
                'reviewerId': "rev2",
                'responses': [
                    {
                        'Q': "Plz answer Q1",
                        'A': "Answer1"
                    },
                    {
                        'Q': "Answer Q2",
                        'A': "Answer2"
                    }

                ]
            }
        },
        "Action": {
            "value": "review",
            "state": "enabled"
        }
    }
    
};

function JSONToArray(jsonVal) {

}
function chartResize() {
    var dc = document.querySelector(".chart-body md-grid-list");
    var dval = [], dLabl = [];
    dc.querySelectorAll("doughnut-chart").forEach(function (el, i) {
        dval.push(el.getAttribute("dataval"));
        dLabl.push(el.getAttribute("datalabel"));
        el.remove();
    });
    dval.forEach(function (el, i) {
        var newDCel = document.createElement("doughnut-chart");
        newDCel.setAttribute("dataval", el);
        newDCel.setAttribute("datalabel", dLabl[i]);
        dc.append(newDCel);
    });
    console.log(dval);
    console.log(dLabl);
    chartHeight();

}
//window.addEventListener('resize', chartResize);
function tableFilter() {
    var answerList = [], uniqueList = [];
    document.querySelectorAll(".response-data-table .table .tablebody .tablerow").forEach(function (el, i) {
        var rowAnsw = [], uniqueRow = [];
        //el.getElementsByClassName("tablecell").forEach(function (elm, indx) {
        el.querySelectorAll(".tablecell").forEach(function (elm, indx) {
            rowAnsw.push(elm.textContent);
            /*if (answerList.length && answerList[indx].indexOf(elm.value) != -1) {
                uniqueRow.push(elm.textContent);
            } else {
                uniqueRow.push("EMPTY");
            }*/
        });
        answerList.push(rowAnsw);
        //uniqueList.push(uniqueRow);

    });
    console.log(answerList);
    //console.log(uniqueList);
}
function getQ(tbl) {
    var arr = [];
    arr.push("Response Id");
    tbl[1].userResponses.forEach(function (el, i) {
        arr.push(el.Q);
    });
    return arr;
}
function getAnswer(tbl) {
    var rowList = [];
    var tblProp = Object.getOwnPropertyNames(tbl);
    tblProp.forEach(function (el, i) {
        if (el != "surveyCompleted" && el != "surveyEngaged" && el != "surveyVisited") {
            var row = [];
            row.push(tbl[el].ResponseID);
            tbl[el].userResponses.forEach(function (elm, indx) {
                row.push(elm.A);
            });
            rowList.push(row);
        }
    });
    return rowList;
}
function getFilterAnswer(answList) {
    var col = [],cls=[];
    for (var i = 0; i < answList[0].length; i++){
        var arr = [],arr1=[];
        for (var j = 0; j < answList.length; j++){
            var val = answList[j][i];
            arr1.push(val);
            if (arr.indexOf(val) == -1) {
                arr.push(val);
            } 
        }        
        col.push(arr);
        cls.push(arr1);
    }
    return [col,cls];
}
var chartcolors = ["#ce4b99", "#A44C3A", "#57B425", "#25A5B4"];
function getValue(uniqArr) {
    uniqArr.forEach(function (el, i) {
        el.forEach(function (elm, indx) {

        })
    })

}
function drawChart(arr,elm) {
    var crclgrp = "";
    var initOff = 25, nxtOff = 25;
    arr.forEach(function (el, i) {
        var k = 100 - el;
        var offs = k + nxtOff;        
        crclgrp += "<circle class='donut-segment' cx='25' cy='25' r='15.91549430918954' fill='transparent' stroke='" + chartcolors[i] + "' stroke-width='13' stroke-dasharray='" + el + ' ' + k + "' stroke-dashoffset='" + nxtOff+"'></circle>";
        nxtOff = (offs <= 100) ? offs : offs - 100;
        
    });
    elm.insertAdjacentHTML('beforeend', crclgrp);

}

function getlabels(uniqueArr, totalArr) {
    var countTot = [];
    uniqueArr.forEach(function (el, i) {
        if (i > 0) {
            var countArr = [],percentage=[],label=[],sum;
            uniqueArr[i].forEach(function (elm, ind) {
                var count = 0;
                totalArr[i].forEach(function (e, id) {
                    if (elm === e) {
                        count += 1;
                    }
                });
                countArr.push(count);
            })
            sum = countArr.reduce(function (tot, num) {
                return tot +  num;
            },0);
            countArr.forEach(function (em, indx) {
                var pc = (em / sum) * 100;
                var eachLabel = [];
                percentage.push(pc);
                eachLabel.push(em);
                eachLabel.push((+pc.toFixed(2)) + "%");
                eachLabel.push(el[indx]);
                label.push(eachLabel);
            })
            countTot.push([percentage,label]);
        }
        //countTot.push(countArr);
    });
    return countTot;

}

function chartHeight() {
    var dcs = document.querySelectorAll('doughnut-chart');
    $(dcs).css("min-height", "");
    var maxHT = [];
    dcs.forEach(function (el, ind) {        
        maxHT.push(el.height);
    });
    var maxheight = Math.max(maxHT);
    $(dcs).css("min-height", maxheight);
}

function startdrawing() {
    var dcs = document.querySelectorAll('doughnut-chart');
    //var maxHT = [];
    dcs.forEach(function (el, ind) {
        el.querySelectorAll("svg circle").forEach(function (elm, idx) {
            if (idx > 1) { elm.remove(); }
        });
        el.querySelectorAll(".legend strong").forEach(function (elm, idx) {
            elm.remove();
        });
        var svg = el.querySelector("svg");
        var arr = svg[0].getAttribute("datavalue").replace("[", "").replace("]", "").split(",");
        drawChart(arr, svg[0]);
        var legendCtr = el.querySelector("div.legend");
        //var label = legendCtr.getAttribute("datalabel").replace("[", "").replace("]", "").split(",");
        var label = JSON.parse(legendCtr.getAttribute("datalabel"));
        var labels = '';
        label.forEach(function (d, i) {
            labels += "<strong style=color:" + chartcolors[i] + "><h4>"+label[i][0]+"<b>, </b></h4><h4>" + label[i][1] + "<b>, </b></h4><small>" + label[i][2] + "</small></strong>";
        })
        legendCtr.insertAdjacentHTML('beforeend', labels);
        //maxHT.push(el.height);
    });
    //var maxheight = Math.max(maxHT);
    //$(dcs).css("min-height", maxheight);
}

function take(targetElem) {
    // First render all SVGs to canvases
    var elements = targetElem.find('svg').map(function () {
        var svg = $(this);
        var canvas = $('<canvas></canvas>');
        svg.replaceWith(canvas);

        // Get the raw SVG string and curate it
        var content = svg.wrap('<p></p>').parent().html();
        content = content.replace(/xlink:title="hide\/show"/g, "");
        content = encodeURIComponent(content);
        svg.unwrap();

        // Create an image from the svg
        var image = new Image();
        image.src = 'data:image/svg+xml,' + content;
        image.onload = function () {
            canvas[0].width = image.width;
            canvas[0].height = image.height;

            // Render the image to the canvas
            var context = canvas[0].getContext('2d');
            context.drawImage(image, 0, 0);
        };
        return {
            svg: svg,
            canvas: canvas
        };
    });
    setTimeout(captureSnap(targetElem[0]), 6000);
    //html2canvas(targetElem[0], {
    //    onrendered: function (canvas) {
    //        // Put the SVGs back in place
    //        elements.each(function () {
    //            this.canvas.replaceWith(this.svg);
    //        });

    //        // Do something with the canvas, for example put it at the bottomva
    //        $(canvas).appendTo('body');
    //    }
    //});
    //targetElem.imagesLoaded(function () {
        // At this point the container has no SVG, it only has HTML and Canvases.

        
    //})
}

function captureSnap(element) {
    var canvas = html2canvas(document.body, { logging: true, async: true, allowTaint: true }).then(function (canvas) {
        document.body.appendChild(canvas);
    });
    console.log(canvas);
    
}
myapp.controller('responsectrl', function ($scope, $mdDialog) {
    $scope.surveyCompleted = table.surveyCompleted;
    $scope.surveyEngaged = table.surveyEngaged;
    $scope.surveyVisited = table.surveyVisited;
    $scope.audienceInterest = Math.round((Number($scope.surveyEngaged) / Number($scope.surveyVisited))*100);
    $scope.papformQuality = Math.round((Number($scope.surveyCompleted) / Number($scope.surveyEngaged))*100);
    $scope.questlist = getQ(table);
    var qt = $scope.questlist.slice();
    qt.splice(0, 1);
    $scope.cards = qt;
    $scope.expandChart = function (evt, indx) {        
        if (!($(evt.target).hasClass("chart-close") || $(evt.target).closest(".chart-close").length)) {
            $(evt.target).closest("doughnut-chart").parent().addClass("pap-zoom");
        }        
    }
    $scope.answerlist = getAnswer(table);
    $scope.uniqueArr = getFilterAnswer($scope.answerlist)[0];
    $scope.totalAnsCol = getFilterAnswer($scope.answerlist)[1];
    //console.log($scope.totalAnsCol);
    var answeredCount = [];
    $scope.totalAnsCol.forEach(function (el, i) {
        answeredCount.push(el.length);
    });
    $scope.totAns = answeredCount;
    $scope.collapseChart = function (evt, indx) {        
        $(evt.target).closest("doughnut-chart").parent().removeClass("pap-zoom");
    }
    //setTimeout(tableFilter, 5000);
    $scope.snap = function (event) {
        var elm = $("body");
        //captureSnap(elm);
        //take(elm);
    }

    $scope.showallinsights = function () {
        $("doughnut-chart,.hide-insights").show();
        $(".show-insights").hide();
    }
    $scope.hideinsights = function () {
        $("doughnut-chart,.show-insights").removeAttr("style");
        $(".hide-insights").hide();
        setTimeout(function () {
            //$(document).scrollTop(0);
            window.scrollTo(0,0);
        }, 500);
        
    }
    $scope.refresh = function (totCount,totAnsCol) {        
        $scope.totCount = totCount;
        $scope.totAnsCol = totAnsCol;
        var ac = [];
        $scope.totAnsCol.forEach(function (el, i) {
            ac.push(el.length);
        });
        $scope.totAns = ac;
        setTimeout(function () {
            startdrawing()
        }, 1000);
        
    }
    $scope.showdetailresponse = function (evt, indx) {
        console.log($(evt.target));
        //var button = angular.element(evt.target).get(0);
        //var rect = button.getBoundingClientRect();
        //var position = { top: rect.top, left: rect.left };
        $mdDialog.show({
            locals: {
                //cards: $scope.cards,
                //uniqueArr: $scope.uniqueArr,
                callback: $scope.responseTable,
                //position: position
            },
            controller: userDetailsController,
            templateUrl: '../partials/response-templates/response-user-details.html',
            parent: $(evt.target).closest('.response-section'),
            targetEvent: evt,
            clickOutsideToClose: true
        })
            .then(function () {
                $scope.status = 'You said the information was.';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });

    }
    $scope.showResponse = function (evt) {
        //console.log("hiiii");
        $mdDialog.show({
            controller: ReviewerController,
            templateUrl: '../partials/PublishPopup.html',
            parent: $(evt.target).closest('body'),
            targetEvent: evt,
            clickOutsideToClose: true,
            //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function () {
                $scope.status = 'You said the information was.';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    }

    function ReviewerController($scope, $mdDialog) {

    }

    setTimeout(chartHeight,5000);
    //chartHeight();
    $scope.openmenu = function (evt, index) {
        //$(evt.currentTarget).siblings(".filterbox").find(".filter-menu").show();
        var button = angular.element(evt.target);
        //var rect = button.getBoundingClientRect();
        var position = { top: evt.screenY, left: evt.screenX};
        $mdDialog.show({
            locals: {
                uniqueArr: $scope.uniqueArr[index],
                callback: $scope.filterTableData,
                position: position
            },
            controller: TableFilterController,
            templateUrl: '../partials/response-templates/tablefitltermenu.html',
            parent: $(evt.target).closest('.tablecell'),
            targetEvent: evt,
            clickOutsideToClose: true,
            //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function () {
                $scope.status = 'You said the information was.';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    };
    $scope.totCount = getlabels($scope.uniqueArr, $scope.totalAnsCol);
    //console.log("----Total Count-----");
    //console.log($scope.totCount);
    $scope.numvalue = $scope.totCount[0];
    $scope.percentage = $scope.totCount[1];
    $scope.label = $scope.totCount[2];
    $scope.startDrawing = true;
    $scope.openfilterMenu = function (evt, index) {
        var button = angular.element(evt.target).get(0);
        var rect = button.getBoundingClientRect();
        var position = { top: rect.top, left: rect.left };
        $mdDialog.show({
            locals: {
                cards: $scope.cards,
                uniqueArr: $scope.uniqueArr,
                callback: $scope.popQuest,
                position: position
            },
            controller: filterAudienceController,
            templateUrl: '../partials/response-templates/filter-audience.html',
            parent: $(evt.target).closest('.chartbox-headers'),
            targetEvent: evt,
            clickOutsideToClose: true
        })
            .then(function () {
                $scope.status = 'You said the information was.';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    }

    $scope.popQuest = function (query) {
        //$scope.filteraudquestions = query;
        //console.log(query);
        var newAnswerList = $scope.answerlist.slice();
        var Answarr = [];
        newAnswerList.forEach(function (el, i) {
            if (query.operator == "equals" && el.indexOf(query.answer) != -1) {
                Answarr.push(el);
            } else if (query.operator == "not" && el.indexOf(query.answer) ==-1) {
                Answarr.push(el);
            }
        });
        //console.log(Answarr);
        $scope.uniqueArrFilt = getFilterAnswer(Answarr)[0];
        $scope.totalAnsColFilt = getFilterAnswer(Answarr)[1];
        //console.log($scope.uniqueArrFilt);
        //console.log($scope.totalAnsColFilt);
        $scope.totCount = getlabels($scope.uniqueArrFilt, $scope.totalAnsColFilt);
        $scope.refresh($scope.totCount, $scope.totalAnsColFilt);
        $scope.hide();
        /*function getfilteredAnswerList(answer, list) {

        }*/
    }
    $scope.filterTableData = function (option) {
        $scope.filterQuery = option;
        $(".table-row").each(function () {
            var $this = $(this);
            $this.find("p").each(function () {
                if ($(this).text() == option) {
                    $(this).closest(".table-row").addClass("searched");
                }
            })
        })
    }

    function userDetailsController($scope, $mdDialog) {
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }

    function TableFilterController($scope, $mdDialog, uniqueArr, callback, position, $timeout) {
        $timeout(function () {
            var el = $('md-dialog');
            var rect = el.get(0).getBoundingClientRect();
            el.css('position', 'fixed');
            el.css('top', position['top'] + el.height);
            el.css('left', (position['left'] - el.width));
        });
        $scope.uniqueArr = uniqueArr;
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.filterTableData = function (option) {
            callback(option);
        }
    }

    function filterAudienceController($scope, $mdDialog, cards, uniqueArr, callback, position, $timeout) {
        $timeout(function () {
            var el = $('md-dialog');
            el.css('top', position['top']);
            el.css('left', position['left']);
        });
        $scope.cards = cards;
        $scope.getAnswers = function () {
            $scope.answers = uniqueArr[$scope.query.question+1];
        }

        $scope.query = {};
        $scope.filteraudquestions = $scope.cards;
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.popQuest = function () {
            $scope.hide();
            callback($scope.query);

        }
    }
    //$scope.totaltable = table;
    $scope.responseid = "Response ID: 345hfgdgxf";
    //$scope.totaltable = {
    //    "row1": {
    //        "col1": "Response ID",
    //        "col2": "Whats your name?",
    //        "col3": "Whats your age?"
    //    },
    //    "row2": {
    //        "col1": "abd23ndjnd",
    //        "col2": "Amit Shaw",
    //        "col3": 35
    //    },
    //    "row3": {
    //        "col1": "abd23ndjnd",
    //        "col2": "Sumit Shaw",
    //        "col3": 27
    //    }
    //};

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
      { name: 'Link', icon: '../asset/img/md-icons/svg/ic_link_black_24px.svg', type: 'link', src: '' },
      { name: 'Use Gallery', icon: '../asset/img/md-icons/svg/ic_photo_library_black_24px.svg', type: 'gallery', src: '' },
      { name: 'Use Camera', icon: '../asset/img/md-icons/svg/ic_add_a_photo_black_24px.svg', type: 'camera', src: '' }
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

myapp.controller('mainCtrl', function ($scope, $mdSidenav) {

    $scope.toggleLeftMenu = buildToggler('left');

    function buildToggler(componentId) {
        return function () {
            $mdSidenav(componentId).toggle();
        };
    }

    $scope.menuitems = [
        {
            name: "Log In",
            enable: false
        },
        {
            name: "My Profile",
            enable: true
        },
        {
            name: "Log Out",
            enable: true
        }
    ];

    $scope.openUserMenu = function ($mdOpenMenu,ev) {
        $mdOpenMenu(ev);
    }
});
