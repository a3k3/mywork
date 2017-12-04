(function ($) {
    $.fn.formbuilder = function (option, settings) {
        if (typeof option === 'object') {
            settings = option;
        }
        else if (typeof option === 'string') {
            var data = this.data('_formbuilder');

            if (data) {
                if (option == 'resize') { data.resize(); return true }
                else if ($.fn.formbuilder.defaultSettings[option] !== undefined) {
                    if (settings !== undefined) {
                        data.settings[option] = settings;
                        return true;
                    }
                    else return data.settings[option];
                }
                else return false;
            }
            else return false;
        }

        settings = $.extend({}, $.fn.formbuilder.defaultSettings, settings || {});

        return this.each(function () {
            var $elem = $(this);

            var $settings = jQuery.extend(true, {}, settings);

            var jsn = new FBfunc($settings);

            $elem.append(jsn.generate());
            jsn.resize();

            $elem.data('_formbuilder', jsn);
        });
    }

    $.fn.formbuilder.defaultSettings = {};

    function FBfunc(settings) {
        this.jsn = null;
        this.settings = settings;

        this.menu = null;

        this.sidebar = null;
        this.jQueryVersion = null;
        this.jQueryUIVersion = null;
        this.jQueryUITheme = null;

        this.codeArea = null;
        this.boxHTML = null;
        this.boxCSS = null;
        this.boxJS = null;
        this.boxResult = null;

        return this;
    }

    FBfunc.prototype =
	{
	    init: function () {
	        this.resize();
	    },

	    generate: function () {
	        var $this = this;

	        if ($this.jsn) return $this.jsn;

	        /************************************************
			 * Menu
			 ************************************************/
	        var menuButton_run = $('<span class="_formbuilder_menuButton">Run</span>').click(function () { $this.run(); });
	        var menuButton_reset = $('<span class="_formbuilder_menuButton">Reset</span>').click(function () { $this.reset(); });
	        var menuButton_copy = $('<span class="_formbuilder_menuButton">Copy</span>').click(function () { $this.copy(); });

	        $this.menu =
			$('<div class="_formbuilder_menu"></div>')
			.append(
				$('<div class="_formbuilder_menuPadding"></div>')
				.append(menuButton_run)
				.append(' <span class="_formbuilder_menuBullet">&bull;</span> ')
				.append(menuButton_reset)
                .append(' <span class="_formbuilder_menuBullet">&bull;</span> ')
                .append(menuButton_copy)
			);

	        /************************************************
			 * Sidebar
			 ************************************************/
	        $this.jQueryVersion = $('<select class="_formbuilder_sidebarSelect"></seletct>');
	        $.each(['1.7.2', '1.7.1', '1.7.0', '1.6.4', '1.6.3', '1.6.2', '1.6.1', '1.6.0', '1.5.2', '1.5.1', '1.5.0', '1.4.4', '1.4.3', '1.4.2', '1.4.1', '1.4.0', '1.3.2', '1.3.1', '1.3.0', '1.2.6', '1.2.3'],
			function (index, version) { $this.jQueryVersion.append('<option value="https://ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery.min.js">jQuery ' + version + '</option>'); });

	        $this.jQueryUIVersion = $('<select class="_formbuilder_sidebarSelect"></seletct>');
	        $.each(['1.8.18', '1.8.17', '1.8.16', '1.8.15', '1.8.14', '1.8.13', '1.8.12', '1.8.11', '1.8.10', '1.8.9', '1.8.8', '1.8.7', '1.8.6', '1.8.5', '1.8.4', '1.8.2', '1.8.1', '1.8.0', '1.7.3', '1.7.2', '1.7.1', '1.7.0', '1.6.0', '1.5.3', '1.5.2'],
			function (index, version) { $this.jQueryUIVersion.append('<option value="https://ajax.googleapis.com/ajax/libs/jqueryui/' + version + '/jquery-ui.min.js">jQuery UI ' + version + '</option>'); });

	        $this.jQueryUITheme = $('<select class="_formbuilder_sidebarSelect"></seletct>');
	        $.each(['base', 'black-tie', 'blitzer', 'cupertino', 'dot-luv', 'excite-bike', 'hot-sneaks', 'humanity', 'mint-choc', 'redmond', 'smoothness', 'south-street', 'start', 'swanky-purse', 'trontastic', 'ui-darkness', 'ui-lightness', 'vader'],
			function (index, version) { $this.jQueryUITheme.append('<option value="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/' + version + '/jquery-ui.css">' + version + '</option>'); });

	        $this.sidebar =
			$('<div class="_formbuilder_sidebar"></div>')
			.append(
				$('<div class="_formbuilder_sidebarPadding"></div>')
				.append('<div class="_formbuilder_sidebarLabel">jQuery Version:</div>')
				.append($this.jQueryVersion)
				.append('<div class="_formbuilder_sidebarLabel">jQuery UI Version:</div>')
				.append($this.jQueryUIVersion)
				.append('<div class="_formbuilder_sidebarLabel">jQuery UI Theme:</div>')
				.append($this.jQueryUITheme)
			);

	        /************************************************
			 * Code Area
			 ************************************************/
	        $this.boxHTML = $('<textarea class="_formbuilder_boxEdit"></textarea>');
	        $this.boxCSS = $('<textarea class="_formbuilder_boxEdit"></textarea>');
	        $this.boxJS = $('<textarea class="_formbuilder_boxEdit"></textarea>');
	        $this.boxResult = $('<iframe id="iframe" class="_formbuilder_boxEdit" frameBorder="0"></iframe>');

	        $.each([$this.boxHTML, $this.boxCSS, $this.boxJS, $this.boxResult], function (index, item) {
	            item
				.focus(function () { $(this).parent().children('._formbuilder_boxLabel').fadeOut(); })
				.blur(function () { $(this).parent().children('._formbuilder_boxLabel').fadeIn(); });
	        });

	        $this.codeArea =
			$('<div class="_formbuilder_codeArea"></div>')
			.append(
				$('<table class="_formbuilder_codeAreaTable" cellpadding="0" cellspacing="1"></table>')
				.append(
					$('<tr></tr>')
					.append(
						$('<td class="_formbuilder_box _formbuilder_boxTop _formbuilder_boxLeft"></td>')
						.append(
							$('<div class="_formbuilder_boxContainer"></div>')
							.append($this.boxHTML)
							.append('<div class="_formbuilder_boxLabel">HTML</div>')
						)
					)
					.append(
						$('<td class="_formbuilder_box _formbuilder_boxBottom _formbuilder_boxRight"></td>')
						.append(
							$('<div class="_formbuilder_boxContainer"></div>')
							.append($this.boxResult)
							.append('<div class="_formbuilder_boxLabel">Result</div>')
						)
					)
				)
                .append(
					$('<tr></tr>')
                    .append(
						$('<td class="_formbuilder_box _formbuilder_copy_box" colspan="2"></td>')
						.append(
							$('<div class="_formbuilder_boxContainer"></div>')
							.append('<textarea class="_formbuilder_boxEdit"></textarea>')
							.append('<div class="_formbuilder_boxLabel">Copy Code</div>')
						)
					)
                )
			)

	        $this.jsn =
			$('<div class="_formbuilder_holder"></div>')
			.append($this.menu) //.append($this.sidebar)
			.append($this.codeArea);

	        return $this.jsn;
	    },

	    run: function () {
	        var html = this.boxHTML.val();
	        var css = this.boxCSS.val();
	        var js = this.boxJS.val();

	        //convert to input expected by our theme
	        var othertypes = ['radio', 'select', 'checkbox'];
	        var questions = []
	        var allInputs = $(html).find(":input");
	        var allCaptions = $(html).find(".caption");
	        var allHints = $(html).find(".hint");
	        $(html).find('label').each(function (index, value) {
	            var current_input = allInputs.eq(index);
	            var current_caption = allCaptions.eq(index);
	            var current_hint = allHints.eq(index);
	            var question = {
	                "id": index + 1,
	                "question": $(this).text(),
	                "name": current_input.attr('name'),
	                "modelname": "",
	                "caption": current_caption.length == 0 ? "" : current_caption.text(),
	                "answertype": current_input.prop("tagName").toLowerCase() == 'input' ? current_input.attr('type') : current_input.prop("tagName").toLowerCase(),
	                "answertheme": "",
	                "hint": current_hint.length == 0 ? "Please see the instructions" : current_hint.text(),
	                "placeholder": current_input.attr('placeholder') != undefined ? current_input.attr('placeholder') :  "Enter here",
	                "validations": {
	                    "required": {
	                        "condition": "true",
	                        "text": "Thats required!"
	                    }
	                }
	            }
	            if ($.inArray(question.answertype.toLowerCase(), othertypes) > -1) {
	                question.options = [];
	                if (question.answertype.toLowerCase() == "select") {
	                    $(this).next().find('option').each(function () {
	                        var option = {
	                            "key": $(this).text(),
	                            "value": $(this).attr('value')
	                        }
	                        question.options.push(option);
	                    });
	                }

	            }
	            questions.push(question);
	        });
	        var action = $(html).attr('action');
	        console.log(questions);

	        var result = 'http://localhost:2472/angular/#/experience';

	        this.writeResult(result, questions, action);
	    },

	    reset: function () {
	        this.boxHTML.val('');
	        this.boxCSS.val('');
	        this.boxJS.val('');
	        this.writeResult('');
	        location.reload();
	    },

	    writeResult: function (result, questions, action) {
	        var iframe = this.boxResult[0];
	        iframe.setAttribute('src', result);

	        if (typeof (Storage) !== "undefined") {
	            // Code for localStorage/sessionStorage.
	            sessionStorage.questionsObj = JSON.stringify(questions);
	            sessionStorage.action = action;
	        } else {
	            // Sorry! No Web Storage support..
	            aler("Sorry! No Web Storage support..");
	        }

	        var origin = prompt("Please enter your orgin e.g. http://www.abc.com");

	        if (origin != null) {
	            sessionStorage.action = sessionStorage.action.indexOf('http') == -1 ? origin + sessionStorage.action : sessionStorage.action;
	        }
	    },

	    resize: function () {
	        var menuHeight = this.menu.outerHeight(true);
	        var jsnHeight = this.jsn.outerHeight(true) - menuHeight;

	        var codeAreaWidth = this.jsn.outerWidth(true) - this.sidebar.outerWidth(true);

	        this.sidebar.css({ top: menuHeight, height: jsnHeight });
	        this.codeArea.css({ top: menuHeight, height: jsnHeight, width: codeAreaWidth });
	    },

	    copy: function () {
	        var iframe = $('#iframe');
	        var src = iframe.attr('src') + '?session=true&questionobj=' + encodeURIComponent(sessionStorage.questionsObj) + "&actionurl=" + sessionStorage.action;
	        var build_code = '<iframe src=' + src + ' width="100%" height="700px"></iframe>'
	        $('._formbuilder_copy_box ._formbuilder_boxEdit').text(build_code);
        }
	}
})(jQuery);