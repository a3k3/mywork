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
        range.startContainer.parentElement.replaceWith(range.startContainer)
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
                nodeValue = range.commonAncestorContainer.nodeValue;
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
            nodeValue = range.commonAncestorContainer.nodeValue;
        }
    }
    return { caretPos: caretPos, nodeValue: nodeValue, selection: sel };
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
                        "placeholder": "Enter Value"
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

    var result = window.location.href.split('#')[0] + '#/experience';

    writeResult(result, questions);
}

function writeResult(result, questions) {
    var iframe = $('.buildpopup .preview_via iframe');
    iframe.attr('src', '');
    iframe.attr('src', result);

    if (typeof (Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        sessionStorage.addviaquestions = JSON.stringify(questions);
    } else {
        // Sorry! No Web Storage support..
        aler("Sorry! No Web Storage support..");
    }
}

var customhtml = "";
var names = []; 

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
        //var question_tag = question_List[index].substr(0, question_List[index].indexOf('?'));
        //var input_text = question_List[index].substr(question_List[index].indexOf("?") + 1);
        //console.log(question_tag + ' --- ' + input_text);


        if (question_List[index] != "") {
            if (question_List[index].indexOf('{') == -1) {
                var question_tag = question_List[index];
                var input_text = question_List[index].substr(question_List[index].indexOf("?") + 1);
                customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="text" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
                console.log(customhtml);
                names.push(customhtml);

            }
            else {
                var question_tag = question_List[index].substr(0, question_List[index].indexOf('{'));
                var input_text = question_List[index].substr(question_List[index].indexOf("}") + 1);
                var regExpne = /\{([^)]+)\}/;
                var matches = regExpne.exec(question_List[index]);
                console.log(matches[1]);
                switch (matches[1]) {
                    case "checkbox":
                        var optionstag = [];
                        var check_diff = /\s*}\s*/;
                        var options_sep = /\s*[a-z]\.\s*/;
                        var options_List = question_List[index].split(check_diff);
                        console.log(options_List);
                        console.log(options_List[1]);
                        var dummy_list_answer = options_List[1].split(options_sep);
                        $.each(dummy_list_answer, function (index, value) {
                            var x = dummy_list_answer[index];
                            var newdf = '<input type="checkbox" name="checkboxa" value="' + x + '">' + x + '</input>';
                            optionstag.push(newdf);
                        });

                        console.log(optionstag);
                        console.log(optionstag.toString());
                        //console.log(optionstag);
                        var result_ = optionstag.toString().replace(/^[, ]+|[, ]+$|[, ]+/g, " ").trim();
                        //var options_List_answer = options_List.split(options_sep);
                        //console.log(options_List[1]);
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label>' + result_ + '';
                        console.log(customhtml);
                        optionstag = [];
                        //var customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="checkbox" name="vehicle" value="Bike">I have a bike<br><input type="checkbox" name="vehicle" value="Car">I have a car';
                        //console.log(customhtml);
                        break;
                    case "radio":
                        var optionstag = [];
                        var check_diff = /\s*}\s*/;
                        var options_sep = /\s*[a-z]\.\s*/;
                        var options_List = question_List[index].split(check_diff);
                        console.log(options_List);
                        console.log(options_List[1]);
                        var dummy_list_answer = options_List[1].split(options_sep);
                        $.each(dummy_list_answer, function (index, value) {
                            var x = dummy_list_answer[index];
                            var newdf = '<input type="radio" name="radioa" value="' + x + '">' + x + '</input>';
                            optionstag.push(newdf);
                        });

                        console.log(optionstag);
                        console.log(optionstag.toString());
                        //console.log(optionstag);
                        var result_ = optionstag.toString().replace(/^[, ]+|[, ]+$|[, ]+/g, " ").trim();
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label>' + result_ + '';
                        console.log(customhtml);
                        optionstag = [];
                        break;
                        //var customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="radio" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
                        //console.log(customhtml);
                        
                    case "date":
                        var customhtml = '<label for="fname">' + question_tag + '?' + '</label><input type="input_calendar" id="fname" name="firstname" placeholder="Your name set.." value=' + input_text + '>';
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
                names.push(customhtml);
            }
        }
    });

    console.log(names);
    var finalhtml_text = '<form action="/action_page.php">' + names + '</form>';
    addviahtml(finalhtml_text);
}

/* App Controllers */

var myapp = angular.module('experienceApp.controllers', ['angular-toArrayFilter','ngAnimate']);

myapp.controller('questionsCtrl', function ($scope, $timeout, $location, $document, $rootScope, $http, $interval, $filter, uploadData, $compile, $window, formData) {

    $rootScope.bodylayout = 'experience-layout';

    $scope.questionsObj = {
        name: "Untitled",
        id: guid(),
        theme: "default",
        questions: [],
        maxCount: function () {
            if (this.questions != undefined && this.questions.length > 0)
                return this.questions.filter(function (item) { return item.enable }).length;
            else
                return 0;
        },
        minCount: 0,
        activeNow: 0,
        percentComplete: function () {
            return (this.activeNow / this.maxCount()) * 100;
        }
    };

    var _formId = $location.search().id;

    formData.getData(_formId).then(function (response) {

        //for utility to work
        if ($location.search().session == "true") {
            $scope.questionsObj.questions = JSON.parse($location.search().questionobj);
            $scope.action = $location.search().actionurl;
        }
        else {
            if (sessionStorage.addviaquestions != undefined) {
                $scope.questionsObj.questions = JSON.parse(sessionStorage.addviaquestions);
            }
            else if (sessionStorage.questionsObj != undefined) {
                $scope.questionsObj.questions = JSON.parse(sessionStorage.questionsObj).questions;
                $scope.questionsObj.cvdata = JSON.parse(sessionStorage.questionsObj).cvdata;
                $scope.questionsObj.formSettings = JSON.parse(sessionStorage.questionsObj).formSettings;
                $scope.applyFormSettings();
            }
            else {
                $scope.questionsObj.name = response.data.name;
                $scope.questionsObj.id = response.data.id;
                $scope.questionsObj.theme = response.data.theme;
                $scope.questionsObj.questions = response.data.questions;
                $scope.questionsObj.cvdata = response.data.cvdata;
                $scope.questionsObj.formSettings = response.data.formSettings;
                $scope.applyFormSettings();
            }
            angular.forEach($scope.questionsObj.questions, function (value, index) {
                value.question = value.question;
                var temp = value.question;
                var tmp = document.createElement("DIV");
                tmp.innerHTML = temp;
                if (angular.element(tmp).find('span').length > 0) {
                    angular.element(tmp).find('span').each(function (index, innervalue) {
                        if ($(innervalue).hasClass('chip')) {
                            var answerfor = $(innervalue).data('question-id');
                            if ($(innervalue).data('type') == 'question') {
                                var insertVal = $('<span ng-bind-html="questionsObj.questions[' + (answerfor - 1) + '].response"></span>');
                                $(innervalue).replaceWith(insertVal);
                            }
                            else if ($(innervalue).data('type') == 'cv') {
                                var option = $scope.questionsObj.cvdata.variables.filter(function (item) { return item.name == answerfor })[0];
                                var tmpOption = document.createElement("DIV");
                                tmpOption.innerHTML = option.calculation;
                                if (angular.element(tmpOption).find('span').length > 0) {
                                    angular.element(tmp).find('span').each(function (index, optionvalue) {
                                        var optionanswerfor = $(optionvalue).data('question-id');
                                        var insertVal = $('<span ng-bind-html="questionsObj.questions[' + (optionanswerfor - 1) + '].response"></span>');
                                        $(optionvalue).replaceWith(insertVal);
                                    });
                                }
                                option.calculation = tmpOption.innerHTML;
                                var Obj = new BigEval();
                                var result = Obj.exec(option.calculation);
                                $(innervalue).replaceWith(result);
                            }
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

    $scope.applyFormSettings = function () {
        $scope.slideSettings = {},
        $scope.generalSettings = {},
        angular.forEach($scope.questionsObj.formSettings, function (value, index) {
            if (value.name == "Slide") {
                $scope.slideSettings = value.settings;
                if (value.settings.randomizequestion.condition) {
                    $scope.questionsObj.questions = shuffleArray($scope.questionsObj.questions);
                }
            }
            else if (value.name == "General") {
                if (value.settings.autocomplete.condition) {
                    $timeout(function () {
                        var regex = /(\#\/)(.*?)(\?|$)/gi;
                        var matches = regex.exec(window.location.href)//window.location.href.match(regex);
                        var reload_url = window.location.href.replace(matches[2], 'cover')
                        window.location.href = reload_url;
                    }, value.settings.autocomplete.time * 60 * 1000);
                }

                if (value.settings.status) {
                    $scope.questionsObj.enable = value.settings.status.selected.name.toLowerCase() == 'enable' ? true : false;
                }
            }
        });
    }

    $scope.$on('questionsFormTheme', function (event, data) {
        $scope.questionsObj.theme = data;
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
            if (_active.index() >= 0 && _active.index() < $scope.questionsObj.maxCount()-1) {
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
        var index = $scope.questionsObj.activeNow - 1;
        if ($scope.questionsObj.questions[index] != undefined && $scope.questionsObj.questions[index].advancedvalidations != undefined) {
            var jumplogic = $scope.questionsObj.questions[index].advancedvalidations.jumplogic;
            var validjumpconditions = jumplogic.logic_options.filter(function(item){ return item.slide_to_show != null});
            if (validjumpconditions.length > 0) {
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
                    if (answer != undefined && answer != "" && answer != "NaN" && item.answer != undefined)
                        if (item.type == "dynamic")
                            return item.answer.value.toLowerCase() === answer.value.toLowerCase();
                        else
                            return item.answer.toLowerCase() === answer.value.toLowerCase();
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
    }

    $scope.checkshowhidevalidation = function () {
        var index = $scope.questionsObj.activeNow;
        if ($scope.questionsObj.questions[index] != undefined && $scope.questionsObj.questions[index].advancedvalidations != undefined) {
            var showhide = $scope.questionsObj.questions[index].advancedvalidations.showhide;
            var validshowhideconditions = showhide.logic_options.filter(function (item) { return item.questionno != null && item.questionno != "Question" });
            if (validshowhideconditions.length > 0) {
                $scope.questionsObj.questions[index].enable = showhide.condition;
                var _condition = true;
                var _relation = null;
                var _previousCondition = null;
                angular.forEach(showhide.logic_options, function (option, i) {
                    var _question = $scope.questionsObj.questions.filter(function (item) {
                        return item.id == option.questionno;
                    })[0];
                    if (_question != undefined) {
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
                            case "equals": if (answer.value == option.answer) _condition = true
                            else _condition = false;
                                break
                            case "not_equals": if (answer.value != option.answer) _condition = true
                            else _condition = false;
                                break
                            case "less_than": if (answer.value < option.answer) _condition = true
                            else _condition = false;
                                break
                            case "greater_than": if (answer.value > option.answer) _condition = true
                            else _condition = false;
                                break
                            case "contains": if (answer.value.indexOf(option.answer)) _condition = true
                            else _condition = false;
                                break
                            default: _condition = true;
                        }

                        if (_previousCondition != null)
                            if (_relation != null && _relation != "") {
                                if(_relation == "or")
                                    _condition = _previousCondition || _condition;
                                else if(_relation == "and")
                                    _condition = _previousCondition && _condition;
                            }
                        _previousCondition = _condition;
                        _relation = option.relation;
                    }
                });

                if (_condition)
                    if (showhide.condition === "true")
                        $scope.questionsObj.questions[index].enable = true;
                    else
                        $scope.questionsObj.questions[index].enable = false;
                else
                    if (showhide.condition === "true")
                        $scope.questionsObj.questions[index].enable = false;
                    else
                        $scope.questionsObj.questions[index].enable = true;
                        

                $scope.changeslideorder = true;
                $scope.changeslideArrangement();
            }
        }
    }

    $scope.$watch('questionsObj.questions', function (newval, oldval) {
        if ($scope.questionsObj.questions != undefined && newval.length > 0) {
            $scope.writeToResponse();
            $scope.checkadvancedvalidation();
            $scope.checkshowhidevalidation();
        }
    }, true);

    $scope.writeToResponse = function () {
        var index = $scope.questionsObj.activeNow - 1;
        if (index > -1) {
            $scope.questionsObj.questions[index].response = "";
            if ($scope.questionsObj.questions[index].options != undefined) {
                var response = $scope.questionsObj.questions[index].options
                angular.forEach(response, function (value, i) {
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

        $timeout(function () {
            $scope.changeslideorder = true;
            $scope.changeslideArrangement();
        }, 1000)
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
        if (_active.index() > 0) {
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

        $timeout(function () {
            $scope.questionsObj.next();
        }, 1000);
        $scope.writeToResponse();
    }

    $scope.sizeSelection = function (index, event, options) {
        var _active = $(event.target).hasClass('size') ? $(event.target) : $(event.target).parent();
        _active.addClass('active').siblings().removeClass('active');
        $.each(options, function (index, value) {
            value.selected = false;
        })
        options[index].selected = true;
        $scope.writeToResponse();
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
        $scope.writeToResponse();
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

        $timeout(function () {
            $scope.questionsObj.next();
        }, 1000);
        $scope.writeToResponse();
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
        $scope.writeToResponse();
    }

    $scope.checkboxSelection = function (index, event, options) {
        var _active = $(event.target).hasClass('mdcheckbox') ? $(event.target) : $(event.target).closest('.mdcheckbox');
        if (_active.hasClass('md-checked')) {
            options[index].selected = false;
        }
        else {
            options[index].selected = true;
        }
        $scope.writeToResponse();
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
        console.log($scope.questionsObj); //send this some service and upon success run below
        var regex = /(\#\/)(.*?)(\?|$)/gi;
        var matches = regex.exec(window.location.href)//window.location.href.match(regex);
        window.location = window.location.href.replace(matches[2], 'success');
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

myapp.controller('successCtrl', function ($scope, getSuccessData, $rootScope, formData, $location) {

    $rootScope.bodylayout = 'success-layout';

    $scope.theme = "mytheme";

    var _formId = $location.search().id;

    if (_formId != undefined) {
        formData.getData(_formId).then(function (response) {
            if (response.data.status == undefined || response.data.status != "None") {
                var success = {};
                success.data = response.data.buildsuccessdata;
                $scope.initSuccess(success);
            }
            else {

            }
        }, function myError(response) {
            $scope.status = response.statusText;
        });
    }
    else {
        getSuccessData.then(function (success) {
            $scope.initSuccess(success);
        }, function myError(response) {
            $scope.status = response.statusText;
        });
    }

    $scope.initSuccess = function (success) {
        $scope.successdata = success.data;
    }

    $scope.$on('successData', function (event, data) {
        $scope.successdata = data;
        //$scope.checkIfTimed();
    });

    if (window.location.href.indexOf('#/success') >= 0 && $(window).width() < 768) {
        angular.element('.experience-screen').css('display', 'inherit');
    }
    else {
        angular.element('.experience-screen').css('display', '');
    }
});

myapp.controller('tabCtrl', function ($scope, $rootScope, $mdDialog, $timeout, formData) {

    $scope.child = {}

    $scope.$watch('child', function () { $scope.$evalAsync(); });

    $rootScope.bodylayout = 'create-layout';

    $scope.themes = [{ type: 'color', value: 'default' }, { type: 'color', value: 'green' }, { type: 'color', value: 'black' }, { type: 'color', value: 'pink' }, { type: 'color', value: 'blue' }, { type: 'color', value: 'yellow' }, { type: 'color', value: 'orange' }];

    $scope.changeTheme = function (event) {
        var theme = $(event.target).data('theme');
        $rootScope.$broadcast('questionsFormTheme', $scope.themes.filter(function (item) { return item.value == theme })[0]);
    }

    function publishController($scope, $mdDialog, formData) {
        $scope.publish = {};
        $scope.publish.type = "banner";
        var regex = /(\#\/)(.*?)(\?|$)/gi;
        var matches = regex.exec(window.location.href)//window.location.href.match(regex);

        var _formBuildData = JSON.parse(sessionStorage.questionsObj)
        _formBuildData.user_id = $rootScope.user.id;

        formData.postData(_formBuildData).success(function (response) {
            console.log(response)
        }).error(function (error) {
            console.log(error);
        })

        $scope.publish.publishUrl = window.location.href.replace(matches[2], 'cover') + '?id=' + $rootScope.formid

        $scope.publish.embedUrl = '<iframe src="' + $scope.publish.publishUrl + '" width="100%" height="100vh"></iframe>';

        $scope.copyUrlText = function (event,inputtype) {
            var element = angular.element(event.target).hasClass('md-button') ? angular.element(event.target) : angular.element(event.target).parent();
            var copytext = element.prev().children(inputtype)[0].select();
            document.execCommand("Copy");
        }

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
            locals: {
                formData: formData
            },
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

myapp.controller('buildCtrl', function ($scope, $document, $rootScope, $mdDialog, $compile, getSettings, getBuildCoverData, getBuildSuccessData, $http, $timeout, getSampleQuestionData, uploadData, $mdBottomSheet, $window, formData) {

    $scope.$watch('buildQuestionsObj', function () {
        $rootScope.$broadcast('questionsData', $scope.buildQuestionsObj);
    });

    var sampleQuestion = {};
    
    getSampleQuestionData.then(function (response) {
        sampleQuestion = response.data;
    }, function myError(response) {
        $scope.status = response.statusText;
    }, true);

    $scope.buildQuestionsObj = {
        name: "Untitled",
        id: guid(),
        theme: "default",
        questions: [],
        buildcoverdata: {},
        buildsuccessdata: {},
        cvdata: {
            variables: []
        },
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
                settings: {
                    autocomplete: {
                        name: "autocomplete",
                        condition: false,
                        time: 0,
                        enable: true
                    },
                    status: {
                        name: "status",
                        options: [
                            {
                                name: "Enable",
                                selected: false,
                                type: '',
                                enable: true
                            },
                            {
                                name: "Disable",
                                selected: false,
                                type: '',
                                enable: true
                            },
                            {
                                name: "Enable after certain date",
                                selected: false,
                                type: 'date',
                                enable: false
                            },
                            {
                                name: "Disable after certain date",
                                selected: false,
                                type: 'date',
                                enable: false
                            },
                            {
                                name: "Disable after ",
                                selected: false,
                                type: 'number',
                                enable: false
                            }
                        ],
                        selected: {
                            name: "Enable",
                            selected: false,
                            type: '',
                            enable: true
                        },
                        enable: true
                    },
                    export: {
                        name: "export",
                        enable: false
                    },
                    duplicate: {
                        name: "duplicate",
                        enable: false
                    },
                    kiosk: {
                        name: "kiosk",
                        condition: false,
                        enable: false
                    }
                }
            },
            {
                name: "Slide",
                enable: true,
                active: false,
                template: 'slideForm',
                settings: {
                    nextquestionprompts: {
                        name: "nextquestionprompts",
                        condition: true,
                        enable: true
                    },
                    questionserialno: {
                        name: "questionserialno",
                        condition: true,
                        enable: true
                    },
                    progressbar: {
                        name: "progressbar",
                        condition: true,
                        enable: true
                    },
                    randomizequestion: {
                        name: "randomizequestion",
                        condition: false,
                        enable: true
                    }
                }
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
                template: 'Integrations',
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
        ],
        metadata: {
            timeOpened: new Date(),
            timezone: (new Date()).getTimezoneOffset() / 60,

            pageon() { return window.location.pathname },
            referrer() { return document.referrer },
            previousSites() { return history.length },

            browserName() { return navigator.appName },
            browserEngine() { return navigator.product },
            browserVersion1a() { return navigator.appVersion },
            browserVersion1b() { return navigator.userAgent },
            browserLanguage() { return navigator.language },
            browserOnline() { return navigator.onLine },
            browserPlatform() { return navigator.platform },
            javaEnabled() { return navigator.javaEnabled() },
            dataCookiesEnabled() { return navigator.cookieEnabled },
            dataCookies1() { return document.cookie },
            dataCookies2() { return decodeURIComponent(document.cookie.split(";")) },
            dataStorage() { return localStorage },

            sizeScreenW() { return screen.width },
            sizeScreenH() { return screen.height },
            sizeDocW() { return document.width },
            sizeDocH() { return document.height },
            sizeInW() { return innerWidth },
            sizeInH() { return innerHeight },
            sizeAvailW() { return screen.availWidth },
            sizeAvailH() { return screen.availHeight },
            scrColorDepth() { return screen.colorDepth },
            scrPixelDepth() { return screen.pixelDepth },


            latitude() { return position.coords.latitude },
            longitude() { return position.coords.longitude },
            accuracy() { return position.coords.accuracy },
            altitude() { return position.coords.altitude },
            altitudeAccuracy() { return position.coords.altitudeAccuracy },
            heading() { return position.coords.heading },
            speed() { return position.coords.speed },
            timestamp() { return position.timestamp },


        },
        usertype: "anonymous"
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

    $scope.$on('buildpopupObjData', function (event, data) {
        $scope.buildQuestionsObj = data;
    });

    getBuildCoverData.then(function (cover) {
        $scope.buildQuestionsObj.buildcoverdata = cover.data;
        $rootScope.$broadcast('coverData', $scope.buildQuestionsObj.buildcoverdata);
        //settings
        getSettings.then(function (response) {
            $scope.buildQuestionsObj.buildcoverdata.settings = response.data.cover.settings;
            //$scope.buildcoverdata.advsettings = response.data.cover.advsettings;
            $scope.buildQuestionsObj.buildcoverdata.defaultsettings = angular.copy($scope.buildQuestionsObj.buildcoverdata.settings);
            if ($scope.buildQuestionsObj.buildcoverdata.settings.covertemplate.condition) {
                $scope.buildQuestionsObj.buildcoverdata.cover_template = 'official';
            }
            else {
                $scope.buildQuestionsObj.buildcoverdata.cover_template = 'default';
            }
            $timeout(function () {
                hideProgressBar();
            }, 500)
        })
    }, function myError(response) {
        $scope.status = response.statusText;
    });

    getBuildSuccessData.then(function (success) {
        $scope.buildQuestionsObj.buildsuccessdata = success.data;
        $rootScope.$broadcast('successData', $scope.buildQuestionsObj.buildsuccessdata);
        //settings
        getSettings.then(function (response) {
            $scope.buildQuestionsObj.buildsuccessdata.settings = response.data.success.settings;
            $scope.buildQuestionsObj.buildsuccessdata.defaultsettings = angular.copy($scope.buildQuestionsObj.buildsuccessdata.settings);
            //$scope.buildsuccessdata.advsettings = response.data.success.advsettings;
            if ($scope.buildQuestionsObj.buildsuccessdata.settings.successtemplate.condition) {
                $scope.buildQuestionsObj.buildsuccessdata.success_template = 'official';
            }
            else {
                $scope.buildQuestionsObj.buildsuccessdata.success_template = 'default';
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
        var tempQuestion = {};
        tempQuestion.id = $scope.buildQuestionsObj.maxCount() + 1;
        $scope.buildQuestionsObj.questions.push(tempQuestion);
        $scope.buildQuestionsObj.activeNow = $scope.buildQuestionsObj.maxCount();
        $scope.addQuestion(['text'], null);

        $rootScope.$broadcast('questionsData', $scope.buildQuestionsObj);
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
            angular.element('.apply-questions-container').find('.flip').eq($scope.buildQuestionsObj.maxCount()).find('.field-type [data-type="text"]').addClass('active');
        }, 1000);
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
        if ($scope.buildQuestionsObj.questions[index].question == undefined || $scope.buildQuestionsObj.questions[index].question == "" || $scope.buildQuestionsObj.questions[index].question == "undefined")
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
                if (tempoptions.length > 0 && (type == "radio" || type == "checkbox" || type == "select")) {
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
        $timeout(function () {
            angular.element(event.target).prev().find('[contenteditable]').focus();
        }, 1000)
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
        if ($scope.buildQuestionsObj.questions[index].answertype != "text" && $scope.buildQuestionsObj.questions[index].answertype != "textarea" && $scope.buildQuestionsObj.questions[index].answertype != "statement") {
            logic.type = "dynamic";
        }
        else {
            logic.type = "static";
        }
        logic.answer_list = $scope.buildQuestionsObj.questions[index].options;
    }

    $scope.updateAdvanceJumpAnswers = function (logic) {
        var index = $scope.buildQuestionsObj.activeNow - 1;
        if ($scope.buildQuestionsObj.questions[index].answertype != "text" && $scope.buildQuestionsObj.questions[index].answertype != "textarea" && $scope.buildQuestionsObj.questions[index].answertype != "statement") {
            logic.type = "dynamic";
        }
        else {
            logic.type = "static";
        }
        logic.answer_list = $scope.buildQuestionsObj.questions[index].options;
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
        if (angular.element('body').width() <= 767) {
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

        hideProgressBar();

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
        hideProgressBar();
        if ($('.navigating_blocks .slideactive').offset().left < 15 && $('.navigating_blocks .slideactive').prevAll().length) {
            $(".navigating_blocks").animate({
                marginLeft: '+=54px'
            }, 500);
        }
    }

    //hide progressbar in build
    function hideProgressBar() {
        if ($('.apply-questions-container .slideactive').find('.cover-page').length > 0 || $('.apply-questions-container .slideactive').find('.app-submit-page').length > 0) {
            angular.element('.build .progressContainer .status').css('display', 'none');
        }
        else {
            angular.element('.build .progressContainer .status').css('display', '');
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
            return '../partials/buildpopup_templates/' + template + '.html';
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
        $scope.addvia = function (event, format) {
            $scope.format = format;
            var target = angular.element(event.target).hasClass('md-button') ? angular.element(event.target) : angular.element(event.target).closest('.md-button');
            target.addClass('md-primary').siblings().removeClass('md-primary');
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
            if (sessionStorage.addviaquestions != undefined) {
                var tempquestions = JSON.parse(sessionStorage.addviaquestions);
                $rootScope.$broadcast('addviaquestions', tempquestions);
                sessionStorage.removeItem('addviaquestions');
            }
            $scope.hide();
        }
        /*******Add Via Slide********/

        /******Share and Embed*****/
        $scope.publish = {};
        $scope.publish.type = "banner";
        var regex = /(\#\/)(.*?)(\?|$)/gi;
        var matches = regex.exec(window.location.href)//window.location.href.match(regex);
        $scope.publish.publishUrl = window.location.href.replace(matches[2], 'cover') + '?id=' + $rootScope.formid

        $scope.publish.embedUrl = '<iframe src="' + $scope.publish.publishUrl + '" width="100%" height="100%"></iframe>';

        $scope.updatePublishIframe = function () {
            if ($scope.publish.type == "banner") {
                $scope.publish.embedUrl = '<iframe src="' + $scope.publish.publishUrl + '" width="100%" height="100vh"></iframe>';
            }
            else if ($scope.publish.type == "load") {
                $scope.publish.embedUrl = '<script type="text/javascript">setTimeout(function(){ alert("load after load"); }, 3000);</script>';
            }
            else {
                $scope.publish.embedUrl = '<script type="text/javascript">setTimeout(function(){ alert("load after scroll"); }, 3000);</script>';
            }
        }

        $scope.copyUrlText = function (event, inputtype) {
            var element = angular.element(event.target).hasClass('md-button') ? angular.element(event.target) : angular.element(event.target).parent();
            var copytext = element.prev().children(inputtype)[0].select();
            document.execCommand("Copy");
        }
        /******Share and Embed*****/

        /****Make Quiz****/
        $scope.buildQuestionsObj.quizData = {};
        $scope.buildQuestionsObj.quizData.totalMax = 0;
        $scope.buildQuestionsObj.quizData.totalMin = 0;
        $scope.$watch('buildQuestionsObj.questions', function (newVal, oldVal) {
            $scope.buildQuestionsObj.quizData.totalMax = $scope.calculateTotal('max');
            $scope.buildQuestionsObj.quizData.totalMin = $scope.calculateTotal('min');
        }, true)
        $scope.calculateTotal = function (type) {
            var _total = 0;
            angular.forEach($scope.buildQuestionsObj.questions, function (value, index) {
                if (type == "max")
                    _total = _total + Math.max.apply(Math, value.options.map(function (option) { return parseInt(option.quizoptionscore); }))
                else
                    _total = _total + Math.min.apply(Math, value.options.map(function (option) { return parseInt(option.quizoptionscore); }))
            })
            return _total
        };
        var resultsconditions = {
            operator: null,
            score: 0,
            grade: null,
            slide_to_show: "none"
        }
        $scope.buildQuestionsObj.quizData.results = [];
        $scope.buildQuestionsObj.quizData.results.push(angular.copy(resultsconditions));
        $scope.addResultCondition = function () {
            $scope.buildQuestionsObj.quizData.results.push(angular.copy(resultsconditions))
        }

        $scope.removeResultCondition = function (index) {
            $scope.buildQuestionsObj.quizData.results.splice(index, 1);
        }

        /****Make Quiz****/

        /******Calculated Variable*****/
        $scope.showCalculate = false;
        $scope.addVariable = function () {
            var _variable = {
                name: "",
                calculation: ""
            }
            $scope.showCalculate = true;
            $scope.variable = _variable;
            $scope.variableindex = -1;
            //$scope.buildQuestionsObj.cvdata.variables.push(_variable);
        }

        $scope.editVariable = function (index) {
            $scope.showCalculate = true;
            $scope.variableindex = index;
            $scope.variable = $scope.buildQuestionsObj.cvdata.variables[index];
        }

        $scope.deleteVariable = function (index) {
            $scope.buildQuestionsObj.cvdata.variables.splice(index, 1);
            $rootScope.$broadcast('buildpopupObjData', $scope.buildQuestionsObj);
        }

        $scope.saveVariable = function () {
            if ($scope.variableindex > -1)
                $scope.buildQuestionsObj.cvdata.variables[$scope.variableindex] = $scope.variable;
            else
                $scope.buildQuestionsObj.cvdata.variables.push($scope.variable);
            $scope.showCalculate = false;

            $rootScope.$broadcast('buildpopupObjData', $scope.buildQuestionsObj);
        }

        $scope.cancelVariable = function () {
            $scope.showCalculate = false;
        }

        $scope.questionList = function () {
            var list = [];
            angular.forEach($scope.buildQuestionsObj.questions, function (value, key) {
                list.push({
                    text: "Question#" + value.id,
                    click: function ($itemScope, $event, modelValue, text, $li) {
                        var type = $($event.target).data('contenttype');
                        var startindex = $($event.target).html().indexOf($scope.cursor[type].nodeValue);
                        var start = $($event.target).html().substring(0, startindex + $scope.cursor[type].caretPos);
                        var texttoAdd = '<span class="chip" data-type="question" data-question-id="' + value.id + '" contenteditable="false" readonly>Question#' + value.id + '<span class="removeChip">-</span></span>';
                        var end = $($event.target).html().substring(startindex + $scope.cursor[type].caretPos);
                        $($event.target).html(start + texttoAdd + end);
                        angular.element('.removeChip').on('click', function (event) {
                            angular.element(event.target).parent().remove();
                        })
                    },
                    hasBottomDivider: true
                })
            });
            return list;
        };

        $scope.menuOptions2 = function () {
            return [{
                text: 'Insert Answer of',
                click: function ($itemScope) { },
                children: $scope.questionList()
            }]
        };

        $scope.cursor = [];

        $scope.setcursorposition = function (event) {
            $scope.cursor[angular.element(event.target).data('contenttype')] = getCaretPosition(event.target);
        }

        $scope.addQuestionToCalculation = function (event, question) {
            var calculationbox = angular.element(event.target).closest('.right_varible').find('.calculations');
            var startindex = calculationbox.html().indexOf($scope.calculationCursor.nodeValue);
            var start = calculationbox.html().substring(0, startindex + $scope.calculationCursor.caretPos);
            var texttoAdd = '<span class="chip" data-question-id=' + question.id + ' contenteditable="false" readonly>' + angular.element(event.target).text() + '<span class="removeChip">-</span></span>';
            var end = calculationbox.html().substring(startindex + $scope.calculationCursor.caretPos);
            calculationbox.html(start + texttoAdd + end);
            angular.element('.removeChip').on('click', function (event) {
                angular.element(event.target).parent().remove();
            })
        }

        $scope.operation = function (event, operator) {
            var calculationbox = angular.element(event.target).closest('.calculatedvariable').find('.calculations');
            calculationbox.html(calculationbox.html() + operator);
        }

        $scope.closeTab = function (tabid) {
            $scope[tabid] = false;
        }
        /******Calculated Variable*****/
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
        hideProgressBar();
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
        if (!$(event.target).hasClass('action-word'))
            $scope.addActionWord();
        else
            $scope.removeActionWord();
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
                    var type = $($event.target).data('contenttype');
                    var startindex = $($event.target).html().indexOf($scope.cursor[type].nodeValue);
                    var start = $($event.target).html().substring(0, startindex + $scope.cursor[type].caretPos);
                    var texttoAdd = '<span class="chip" data-type="question" data-question-id="' + value.id + '" contenteditable="false" readonly>Question#' + value.id + '<span class="removeChip">-</span></span>';
                    var end = $($event.target).html().substring(startindex + $scope.cursor[type].caretPos);
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

    //$scope.questionList2 = function () {
    //    var list = [];
    //    angular.forEach($scope.buildQuestionsObj.questions, function (value, key) {
    //        list.push({
    //            text: "Question#" + value.id,
    //            click: function ($itemScope, $event, modelValue, text, $li) {
    //                var startindex = $($event.target).html().indexOf($scope.calculationCursor.nodeValue);
    //                var start = $($event.target).html().substring(0, startindex + $scope.calculationCursor.caretPos);
    //                var texttoAdd = '<span class="chip" data-type="question" data-question-id="' + value.id + '" contenteditable="false" readonly>Question#' + value.id + '<span class="removeChip">-</span></span>';
    //                var end = $($event.target).html().substring(startindex + $scope.calculationCursor.caretPos);
    //                $($event.target).html(start + texttoAdd + end);
    //                angular.element('.removeChip').on('click', function (event) {
    //                    angular.element(event.target).parent().remove();
    //                })
    //            },
    //            hasBottomDivider: true
    //        })
    //    });
    //    return list;
    //}

    $scope.calculatedVariableList = function () {
        var list = [];
        angular.forEach($scope.buildQuestionsObj.cvdata.variables, function (value, key) {
            if (value.name != "") {
                list.push({
                    text: value.name,
                    click: function ($itemScope, $event, modelValue, text, $li) {
                        var type = $($event.target).data('contenttype');
                        var startindex = $($event.target).html().indexOf($scope.cursor[type].nodeValue);
                        var start = $($event.target).html().substring(0, startindex + $scope.cursor[type].caretPos);
                        var texttoAdd = '<span class="chip" data-type="cv" data-question-id="' + value.name + '" contenteditable="false" readonly>' + value.name + '<span class="removeChip">-</span></span>';
                        var end = $($event.target).html().substring(startindex + $scope.cursor[type].caretPos);
                        $($event.target).html(start + texttoAdd + end);
                        angular.element('.removeChip').on('click', function (event) {
                            angular.element(event.target).parent().remove();
                        })
                    },
                    hasBottomDivider: true
                })
            }
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

    $scope.menuOptions2 = function () {
        return [{
            text: 'Insert Answer of',
            click: function ($itemScope) { },
            children: $scope.questionList()
        }]
    };

    $scope.menuOptionsRest = function () {
        return [{
            text: 'Highlight',
            click: function ($itemScope, $event) {
                $scope.highlightSelection($event)
            },
            hasBottomDivider: true
        }]
    };

    $scope.cursor = [];

    $scope.setcursorposition = function (event) {
        $scope.cursor[angular.element(event.target).data('contenttype')] = getCaretPosition(event.target);
    }

    $scope.addQuestionToCalculation = function (event, question) {
        var calculationbox = angular.element(event.target).closest('.logic_options').find('.calculations');
        var startindex = calculationbox.html().indexOf($scope.calculationCursor.nodeValue);
        var start = calculationbox.html().substring(0, startindex + $scope.calculationCursor.caretPos);
        var texttoAdd = '<span class="chip" data-question-id=' + question.id + ' contenteditable="false" readonly>' + angular.element(event.target).text() + '<span class="removeChip">-</span></span>';
        var end = calculationbox.html().substring(startindex + $scope.calculationCursor.caretPos);
        calculationbox.html(start + texttoAdd + end);
        angular.element('.removeChip').on('click', function (event) {
            angular.element(event.target).parent().remove();
        });
    }

    $scope.operation = function (event, operator) {
        var calculationbox = angular.element(event.target).closest('.calculatedvariable').find('.calculations');
        calculationbox.html(calculationbox.html() + operator);
    }

    $scope.contentEdit = function (e) {
        var keycode = e.which ? e.which : e.keyCode;
        if (keycode == 13) {
            if (!e.shiftKey) {
                e.preventDefault();
                $timeout(function () {
                    angular.element(e.target).closest(".option").parent().find('.add-option').triggerHandler('click');
                });
            }
        }
    }

    angular.element($window).bind('resize', function () {
        //console.log('resize');
        if ($(window).width() > 797)
            angular.element('.navigation-slide md-card').css('width', angular.element('.navigation-slide md-card').css('height'));
        else
            angular.element('.navigation-slide md-card').css('width', '');
    });
});

myapp.controller('coverCtrl', function ($scope, getCoverData, $http, $rootScope, $controller, $interval, $location, formData) {

    $rootScope.bodylayout = 'cover-layout';
    var _formId = $location.search().id;

    if (_formId != undefined) {
        formData.getData(_formId).then(function (response) {
            if (response.data.status == undefined || response.data.status != "None") {
                var cover = {};
                cover.data = response.data.buildcoverdata;
                $scope.initCover(cover);
            }
            else {

            }
        }, function myError(response) {
            $scope.status = response.statusText;
        });
    }
    else {
        getCoverData.then(function (cover) {
            $scope.initCover(cover);
        }, function myError(response) {
            $scope.status = response.statusText;
        });
    }

    $scope.initCover = function (cover) {
        if (cover.data.settings.disablecover != undefined && cover.data.settings.disablecover.condition && window.location.href.indexOf('create') == -1) {
            $scope.gotoExperience('experience', null);
        }
        else {
            $scope.coverdata = cover.data;
            $scope.checkIfTimed();
        }
    }

    $scope.$on('coverData', function (event, data) {
        $scope.coverdata = data;
        $scope.checkIfTimed();
    });

    angular.extend(this, $controller('tabCtrl', { $scope: $scope }));
    //extend the scope
    var superclass = angular.extend({}, $scope);

    $scope.gotoExperience = function (url, event) {
        if (event != null && $(event.target).closest('.create-tabs').length > 0) {
            if (superclass.gotoExperience) {
                superclass.gotoExperience();
            }
        }
        else {
            var regex = /(\#\/)(.*?)(\?|$)/gi;
            var matches = regex.exec(window.location.href)//window.location.href.match(regex);
            window.location = window.location.href.replace(matches[2], url);
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
                        $scope.gotoExperience('experience', null);
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

var table;

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

function tableFilter() {
    var answerList = [], uniqueList = [];
    document.querySelectorAll(".response-data-table .table .tablebody .tablerow").forEach(function (el, i) {
        var rowAnsw = [], uniqueRow = [];        
        el.querySelectorAll(".tablecell").forEach(function (elm, indx) {
            rowAnsw.push(elm.textContent);            
        });
        answerList.push(rowAnsw);       
    });    
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
    var col = [], cls = [];
    for (var i = 0; i < answList[0].length; i++) {
        var arr = [], arr1 = [];
        for (var j = 0; j < answList.length; j++) {
            var val = answList[j][i];
            arr1.push(val);
            if (arr.indexOf(val) == -1) {
                arr.push(val);
            }
        }
        col.push(arr);
        cls.push(arr1);
    }
    return [col, cls];
}
var chartcolors = ["#ce4b99", "#A44C3A", "#57B425", "#25A5B4"];
function getValue(uniqArr) {
    uniqArr.forEach(function (el, i) {
        el.forEach(function (elm, indx) {

        })
    })

}
function drawChart(arr, elm) {
    var crclgrp = "";
    var initOff = 25, nxtOff = 25;
    arr.forEach(function (el, i) {
        var k = 100 - el;
        var offs = k + nxtOff;
        crclgrp += "<circle class='donut-segment' cx='25' cy='25' r='15.91549430918954' fill='transparent' stroke='" + chartcolors[i] + "' stroke-width='13' stroke-dasharray='" + el + ' ' + k + "' stroke-dashoffset='" + nxtOff + "'></circle>";
        nxtOff = (offs <= 100) ? offs : offs - 100;

    });
    elm.insertAdjacentHTML('beforeend', crclgrp);

}

function getlabels(uniqueArr, totalArr) {
    var countTot = [];
    uniqueArr.forEach(function (el, i) {
        if (i > 0) {
            var countArr = [], percentage = [], label = [], sum;
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
                return tot + num;
            }, 0);
            countArr.forEach(function (em, indx) {
                var pc = (em / sum) * 100;
                var eachLabel = [];
                percentage.push(pc);
                eachLabel.push(em);
                eachLabel.push((+pc.toFixed(2)) + "%");
                eachLabel.push(el[indx]);
                label.push(eachLabel);
            })
            countTot.push([percentage, label]);
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
            labels += "<strong style=color:" + chartcolors[i] + "><h4>" + label[i][0] + "<b>, </b></h4><h4>" + label[i][1] + "<b>, </b></h4><small>" + label[i][2] + "</small></strong>";
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

function tablDataToCSV() {
    

}

function captureSnap(element) {
    var canvas = html2canvas(document.body, { logging: true, async: true, allowTaint: true }).then(function (canvas) {
        document.body.appendChild(canvas);
    });
    console.log(canvas);

}
myapp.controller('responsectrl', function ($scope, $mdDialog, getResponseData,$timeout) {
    getResponseData.then(function (response) {
        table = response.data;
    
    $scope.surveyCompleted = table.surveyCompleted;
    $scope.surveyEngaged = table.surveyEngaged;
    $scope.surveyVisited = table.surveyVisited;
    $scope.audienceInterest = Math.round((Number($scope.surveyEngaged) / Number($scope.surveyVisited)) * 100);
    $scope.papformQuality = Math.round((Number($scope.surveyCompleted) / Number($scope.surveyEngaged)) * 100);
    $scope.questlist = getQ(table);
    var qt = $scope.questlist.slice();
    qt.splice(0, 1);
    $scope.cards = qt;
    $scope.expandChart = function (evt, indx) {
        var $tgt = $(evt.target);
        if (!($tgt.hasClass("chart-close") || $tgt.closest(".chart-close").length)) {
            $tgt.closest("doughnut-chart").parent().addClass("pap-zoom");
            var offset = $tgt.closest("doughnut-chart").offset().top - $(".chartbox-headers").height()-48;
            document.querySelectorAll("#tab-content-4")[0].scrollTo(0, offset);
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
    };
    $scope.removeFilter = function () {
        $(".tablebody.filterApplied").removeClass("filterApplied").removeAttr("filtercol");
        $(".tablerow.searched").removeClass("searched");
        $(".tablecell.matched").removeClass("matched");
        $(".tablecell.colmatched").removeClass("colmatched");
        $(".table.colmatched-table").removeClass("colmatched-table");        
    }
    $scope.exporttocsv = function () {
        var csvstring = "";
        document.querySelectorAll(".tablehead .tablecell").forEach(function (val) {
            if ($(".table").hasClass("colmatched-table")) {
                if ($(val).hasClass("colmatched") || !$(val).index()) {
                    csvstring += val.getElementsByTagName("p")[0].textContent + ",";
                }
            } else {
                csvstring += val.getElementsByTagName("p")[0].textContent + ",";
            }            
        })
        csvstring += "\n";
        if (document.querySelectorAll(".tablebody.filterApplied").length) {
            var slct = document.querySelectorAll(".tablebody .tablerow.searched");
        } else {
            var slct = document.querySelectorAll(".tablebody .tablerow");
        }
        slct.forEach(function (val) {
            val.querySelectorAll(".tablecell").forEach(function (value) {
                if ($(".table").hasClass("colmatched-table")) {
                    if ($(value).hasClass("colmatched")|| !$(value).index()) {
                        csvstring += value.getElementsByTagName("p")[0].textContent + ",";
                    }
                } else {
                    csvstring += value.getElementsByTagName("p")[0].textContent + ",";
                }   
                
            })
            csvstring += "\n";
        });
        var btn = document.createElement("a");
        btn.setAttribute("download", "reponseTable.csv");
        btn.setAttribute("href", 'data:application/csv;charset=UTF-8,' + encodeURIComponent(csvstring));        
        btn.click();     

    };
    //setTimeout(tableFilter, 5000);
    $scope.snap = function (event) {
        var elm = $("body");
        $('img[data-url]').each(function () {
        });


        //captureSnap(elm);
        //take(elm);
    }

    $scope.showallinsights = function () {
        $("doughnut-chart,.hide-insights").show();
        $(".show-insights").hide();
    }
    $scope.hideinsights = function () {
        $("doughnut-chart,.show-insights").removeAttr("style");        
        document.querySelectorAll("#tab-content-4")[0].scrollTo(0, 0);
        $(".hide-insights").hide();
    }
    $scope.refresh = function (totCount, totAnsCol) {
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
        $mdDialog.show({
            locals: {                
                callback: $scope.responseTable,                
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
            templateUrl: '../partials/response-templates/response-user-details.html',
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

    function ReviewerController($scope, $mdDialog,targetEvent) {
        $scope.responseid = $(targetEvent.currentTarget).find(".tablecell").first().find("p").text();
        $scope.qblocks = filterTblObj($scope.responseid).userResponses;
        $scope.reviewers = filterTblObj($scope.responseid).reviewerResponses;
        function filterTblObj(id) {
            var obj;
            Object.keys(table).forEach(function (i) {
                if (table[i].hasOwnProperty("ResponseID") && table[i].ResponseID == id) {
                    obj=table[i];
                    //break;
                }
            })
            return obj;
        }
    }

    setTimeout(chartHeight, 5000);
    //chartHeight();
    $scope.openQuestList = function (evt) {
        var button = angular.element(evt.target);
        var position = { top: evt.screenY, left: evt.screenX };
        $mdDialog.show({
            locals: {
                questArr: $scope.questlist.slice(1),
                callback: $scope.filterColmData,
                position: position
            },
            controller: TableFilterColmController,
            templateUrl: '../partials/response-templates/question-filter.html',
            parent: $(evt.target).closest(".action-bar"),
            targetEvent: evt,
            clickOutsideToClose: true            
        })
            .then(function () {
                $scope.status = 'You said the information was.';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    }
    $scope.openmenu = function (evt, index) {        
        var button = angular.element(evt.target);        
        var position = { top: evt.screenY, left: evt.screenX };
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
        var newAnswerList = $scope.answerlist.slice();
        var Answarr = [];
        newAnswerList.forEach(function (el, i) {
            if (query.operator == "equals" && el.indexOf(query.answer) != -1) {
                Answarr.push(el);
            } else if (query.operator == "not" && el.indexOf(query.answer) == -1) {
                Answarr.push(el);
            }
        });        
        $scope.uniqueArrFilt = getFilterAnswer(Answarr)[0];
        $scope.totalAnsColFilt = getFilterAnswer(Answarr)[1];        
        $scope.totCount = getlabels($scope.uniqueArrFilt, $scope.totalAnsColFilt);
        $scope.refresh($scope.totCount, $scope.totalAnsColFilt);
        $scope.hide();       
    }
    $scope.filterTableData = function (event) {
        $timeout(function () {
            var optArr = [];
            var $evtTargt = $(event.target);
            var index = $evtTargt.closest(".tablecell").index();
            var filterAtr = $evtTargt.closest(".tablehead").siblings(".tablebody").attr("filtercol");
            var filterCol = (filterAtr != undefined) ? (filterAtr.indexOf(index) != -1) ? filterAtr: (filterAtr + "," + index) : index;           
            if ($evtTargt.closest("md-checkbox").attr("value") == "NULL") {
                var $El = $evtTargt.closest("md-dialog").find("md-checkbox");                
            } else {
                var $El = $evtTargt.closest("md-dialog").find(".md-checked");                
            }
            angular.forEach($El, function (val, key) {
                optArr.push($(val).attr("value"));
            });            
            var angEl = $(".tablebody").hasClass("filterApplied") ? angular.element(".tablerow") : angular.element(".tablerow");

            angular.forEach(angEl, function (val, key) {
                $(val).removeClass("searched");
                var $tblCl = $(val).find(".tablecell:eq(" + index + ")");
                var searchVal = $tblCl.find("p").text();
                if (optArr.indexOf(searchVal) >= 0) {
                    $tblCl.addClass("matched");
                    var mtAr = [];
                    var filterArr = (typeof (filterCol) == "number") ? [filterCol] : filterCol.split(",");
                    filterArr.forEach(function (value, index) {
                        if ($(val).find(".tablecell:eq(" + value + ")").hasClass("matched")) {
                            mtAr.push(1);
                        } else {
                            mtAr.push(0);
                        }
                    });
                    if (mtAr.indexOf(0) == -1) {
                        $tblCl.closest(".tablerow").addClass("searched");
                    }
                    $tblCl.closest(".tablebody").addClass("filterApplied").attr("filtercol", filterCol);
                }                
                //$(val).closest(".tablerow.tmpsearch").removeClass("tmpsearch");
            }); 
        }, 1000)       
    }

    $scope.filterColmData = function (event) {
        $timeout(function () {
            var optArr = [],indexArr=[];
            var $evtTargt = $(event.target);
            //var index = $evtTargt.closest("md-dialog").index();
            //var filterAtr = $evtTargt.closest(".tablehead").siblings(".tablebody").attr("filtercol");
            //var filterCol = (filterAtr != undefined) ? (filterAtr.indexOf(index) != -1) ? filterAtr : (filterAtr + "," + index) : index;            
            angular.forEach($evtTargt.closest("md-dialog").find(".md-checked"), function (val, key) {
                optArr.push($(val).index());
            });
            $(".tablecell").removeClass("colmatched");
            $(".table").removeClass("colmatched-table");
            if (optArr.indexOf(0) == -1) {
                angular.forEach($(".tablecell"), function (value, key) {
                    if (optArr.indexOf($(value).index()) >= 0) {
                        $(value).addClass("colmatched");
                    }
                    //$(".tablehead .tablecell:eq(" + value + ")").addClass("colmatched");
                    //$(".tablerow .tablecell:eq(" + value + ")").addClass("colmatched");
                });                
                $(".table").addClass("colmatched-table");
            }            
        }, 1000)       
    }

    function userDetailsController($scope, $mdDialog) {
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }
    function TableFilterColmController($scope, $mdDialog, questArr, callback, position, $timeout) {
        $timeout(function () {
            var el = $('md-dialog');
            var rect = el.get(0).getBoundingClientRect();
            el.css('position', 'fixed');
            el.css('top', position['top'] + el.height);
            el.css('left', (position['left'] - el.width));
        });
        $scope.questArr = questArr;
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.filterColmData = function (event) {
            callback(event);
        }
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

        $scope.filterTableData = function (event) {
            callback(event);
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
            $scope.answers = uniqueArr[$scope.query.question + 1];
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
    

    
    }, function myerror(response) {
        //console.log(response);
    })
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

myapp.controller('mainCtrl', function ($scope, $mdSidenav, FBLogin, $rootScope, $window, $mdDialog, $interval) {

    $scope.toggleLeftMenu = buildToggler('left');
    $rootScope.loginstatus = false;

    function buildToggler(componentId) {
        return function () {
            $mdSidenav(componentId).toggle();
        };
    }

    $rootScope.$watch('loginstatus', function (newval, oldval) {
        $scope.menuitems = [
        {
            name: "Log In",
            enable: !$rootScope.loginstatus,
            action: 'logIn'
        },
        {
            name: "My Profile",
            enable: $rootScope.loginstatus,
            action: 'showProfile'
        },
        {
            name: "Log Out",
            enable: $rootScope.loginstatus,
            action: 'logOut'
        }
        ];
        if (newval == true) {
            $mdDialog.cancel()
        }
    }, true)

    $scope.openUserMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    }

    $scope.menuClick = function (evt, action) {
        if (action == 'logIn') {
            $mdDialog.show({
                contentElement: '#myDialog',
                parent: angular.element(document.body),
                targetEvent: evt,
                clickOutsideToClose: true
            })
            .then(function () {
                $scope.status = 'You said the information was.';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
        }
        if (action == 'logOut') {
            if ($rootScope.user.logintype == 'fb') {
                FBLogin.logout();
                $rootScope.user.image = '../asset/img/md-icons/svg/ic_person_black_24px.svg';
            }
            else if ($rootScope.user.logintype == 'google') {
                gapi.auth.signOut();
                $rootScope.user.image = '../asset/img/md-icons/svg/ic_person_black_24px.svg';
            }
        }
    }

    function userLogInController($scope, $mdDialog) {
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }

    $scope.activeArray = 1;
    $scope.coord = '';
    $scope.accordionConfig = {
        debug: false,
        animDur: 300,
        expandFirst: false,
        autoCollapse: true,
        watchInternalChanges: false,
        headerClass: '',
        beforeHeader: '',
        afterHeader: '<div class="drop-icon-wrapper sir-accordion-vertical-align"><i class="glyphicon glyphicon-menu-down"></i></div>',
        topContentClass: '',
        beforeTopContent: '',
        afterTopContent: '',
        bottomContentClass: '',
        beforeBottomContent: '',
        afterBottomContent: ''
    };

    $scope.accordionArray =
    [
      {
          "title": "My PapForms", "topContent": null, "bottomContent": '<div class="content"><a href="#">market survey</a></div><div class="content"><a href="#">digital marketing</a></div>'
      },
      {
          "title": "My PapTemplates", "topContent": null, "bottomContent": '<div class="content"><a href="#">market survey</a></div><div class="content"><a href="#">digital marketing</a></div>'
      },
      {
          "title": "Tutorials/FAQ", "topContent": null, "bottomContent": '<div class="content"><a href="#">market survey</a></div><div class="content"><a href="#">digital marketing</a></div>'
      }
    ];

    /********Login Section********/
    $rootScope.user = {};
    $rootScope.user.image = '../asset/img/md-icons/svg/ic_person_black_24px.svg';

    $window.fbAsyncInit = function () {
        // Executed when the SDK is loaded

        FB.init({
            appId: '160699188044730',
            channelUrl: '../partials/channel.html',
            status: true,
            cookie: true,
            xfbml: true,
            version: 'v2.11'
        });

        FBLogin.watchLoginChange();
    };

    (function (d) {
        // load the Facebook javascript SDK

        var js,
        id = 'facebook-jssdk',
        ref = d.getElementsByTagName('script')[0];

        if (d.getElementById(id)) {
            return;
        }

        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.11&appId=160699188044730&autoLogAppEvents=1';

        ref.parentNode.insertBefore(js, ref);

    }(document));

    (function () {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/client:plusone.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();
    /********Login Section********/

    /********Google Login*******/
    // Here we do the authentication processing and error handling.
    // Note that authResult is a JSON object.
    $scope.processAuth = function (authResult) {
        // Do a check if authentication has been successful.
        if (authResult['access_token']) {
            // Successful sign in.
            $scope.loginstatus = true;
            $scope.getUserInfo();
        } else if (authResult['error']) {
            // Error while signing in.
            $scope.loginstatus = false;

            // Report error.
        }
    };

    // When callback is received, we need to process authentication.
    $scope.signInCallback = function (authResult) {
        $scope.processAuth(authResult);
    };

    // Render the sign in button.
    $scope.renderSignInButton = function () {
        gapi.signin.render('signInButton',
            {
                'callback': $scope.signInCallback, // Function handling the callback.
                'clientid': '1055571027314-qo369uaquc3rjapkhnrtrnp5c3pa0n2g.apps.googleusercontent.com', // CLIENT_ID from developer console which has been explained earlier.
                'requestvisibleactions': 'http://schemas.google.com/AddActivity', // Visible actions, scope and cookie policy wont be described now,
                // as their explanation is available in Google+ API Documentation.
                'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
                'cookiepolicy': 'single_host_origin'
            }
        );
    }

    // Start function in this example only renders the sign in button.
    $scope.start = function () {
        $scope.renderSignInButton();
    };

    // Call start function on load.
    $scope.load = function () {
        var gt = $interval(function () {
            if (gapi != undefined) {
                $interval.cancel(gt);
                $scope.start();
                $mdDialog.show({
                    contentElement: '#myDialog',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                })
                .then(function () {
                    $scope.status = 'You said the information was.';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
            }
        }, 100);
    };

    // When callback is received, process user info.
    $scope.userInfoCallback = function (userInfo) {
        // You can check user info for domain.
        $rootScope.$apply(function () {
            $rootScope.user.name = userInfo.displayName;
            $rootScope.user.logintype = 'google';
            $rootScope.user.id = userInfo.id;
            $rootScope.user.image = userInfo.image.url;
            $rootScope.loginstatus = true;
        })
    };

    // Request user info.
    $scope.getUserInfo = function () {
        gapi.client.request(
            {
                'path': '/plus/v1/people/me',
                'method': 'GET',
                'callback': $scope.userInfoCallback
            }
        );
    };
    /********Google Login*******/
});
