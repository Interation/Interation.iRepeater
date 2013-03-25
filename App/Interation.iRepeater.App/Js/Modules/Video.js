var video =
{
    init: function ()
    {
        var _this = this;
        this._timer = {};

        $("video").click(function (event) { _this._click(this, event); })
                  .keydown(function () { return false; })
                  .bind("ended", function (event) { _this._ended(this, event); })
                  .bind("timeupdate", function (event) { _this._timeupdate(this, event); });
        $(window).keyup(function (event) { _this._keyup(this, event); })
                 .mousemove(function (event) { _this._mousemove(this, event); })
                 .mouseup(function () { _this._mouseup(this, event); })
                 .bind("selectstart", function () { return false; });
        $("div#control a.play").click(function (event) { _this.play(this, event); });
        $("div#control a.back").click(function (event) { history.go(-1); });
        $("div#repeat a.outcrop").bind("drag", function () { return false; })
                                 .mousedown(function (event) { _this._mousedown(this, event); });
        $("div#repeat a.close").click(function () { _this._toggleRepeat(false); });
        $("div#repeat span.time").live("click", function (event) { event.stopPropagation(); });
        $("div#repeat ul.subtitle>li").live("click", function (event) { _this._click(this, event); })
                                      .live("mousedown", function (event) { event.stopPropagation(); });
        $("div#repeat a.selector").live("click", function (event) { _this._click(this, event); })
                                  .live("drag", function (event) { event.stopPropagation(); });

        this._resizePage($(window).width(), $(window).height());
        this._sliderVolumn = this._generateVolumnSlider();
        this._sliderProgress = this._generateProgressSlider();
        this._toggleRepeat(true);
        this._loading();
    },
    play: function (sender, event)
    {
        sender = $(sender);
        var video = $("video").get(0);

        if (sender.hasClass("pause"))
        {
            video.pause();
            sender.removeClass("pause");
            this._togglePanel(true);
        }
        else
        {
            video.play();
            sender.addClass("pause");
            this._togglePanel(false);
        }
    },
    _loading: function ()
    {
        var json =
        {
            url: "data/product.table",
            data: { id: this._getQueryStringId() },
            success: function (product)
            {
                _this._product = product;
                _this._loadingVideo(0);
            },
            error: function (response)
            {
            }
        };

        var _this = this;
        this._getInfo(json);
    },
    _getInfo: function (options)
    {
        var json =
        {
            url: options.url,
            success: function (text)
            {
                var element = $(text).find("product[id=" + options.data.id + "]");

                if (typeof options.success == "function")
                {
                    var info =
                    {
                        id: options.data.id,
                        name: element.attr("name"),
                        category: element.attr("category"),
                        resources: $.convert(element.children("resource"), function (i, resource)
                        {
                            resource = $(resource);

                            return {
                                name: resource.attr("name"),
                                src: resource.attr("src"),
                                type: resource.attr("type"),
                                subtitles: $.convert(resource.children("subtitle"), function (ii, subtitle)
                                {
                                    subtitle = $(subtitle);

                                    return subtitle =
                                    {
                                        name: subtitle.attr("name"),
                                        src: subtitle.attr("src")
                                    };
                                })
                            };
                        })
                    };

                    options.success(info);
                }
            },
            error: function (response)
            {
                if (typeof options.error == "function")
                {
                    options.error(response);
                }
            }
        };

        $.getFile(json);
    },
    _getQueryStringId: function ()
    {
        return 1;
        return (function (regExp, href) { return regExp.test(href) ? regExp.exec(href)[2] : 0; })(/(\?|$)id=(\d+)/i, location.href);
    },
    _timeupdate: function (sender, event)
    {
        $("span.timer.current").text(this._formatTime(sender.currentTime));
        $("span.timer.rest").text("-" + this._formatTime(sender.duration - sender.currentTime));

        this._sliderProgress.setValue(sender.currentTime);
    },
    _formatTime: function (seconds)
    {
        var minutes = parseInt(seconds / 60);
        seconds = parseInt(seconds - 60 * minutes);
        if (seconds < 10) { seconds = "0" + seconds; }
        return minutes + ":" + seconds;
    },
    _loadingVideo: function (index)
    {
        var _this = this;
        this._resourceIndex = index = index || 0;

        var product = this._product;
        if (product == undefined) { return; }
        if (product.resources.length < index + 1) { return; }

        var resource = product.resources[this._resourceIndex];
        if (resource == undefined) { return; }

        var video = $("video").get(0);
        video.src = resource.src;
        video.type = resource.type;

        this._loadingSubtitle(0);

        this._timer.loading = setInterval(function ()
        {
            try
            {
                if (video.readyState > 0)
                {
                    $("span.timer.current").text(_this._formatTime(video.currentTime));
                    $("span.timer.rest").text("-" + _this._formatTime(video.duration));

                    _this._togglePanel(true);
                    _this._sliderProgress.reset(0, video.duration, video.currentTime);

                    clearInterval(_this._timer.loading);
                }
            }
            catch (e)
            {
                clearInterval(_this._timer.loading);
            }
        }, 10);
    },
    _loadingSubtitle: function (index)
    {
        var _this = this;
        this._subtitleIndex = index = index || 0;

        var product = this._product;
        if (product.resources == undefined) { return; }
        if (product.resources.length < this._resourceIndex + 1) { return; }

        var resource = product.resources[this._resourceIndex];
        if (resource == undefined) { return; }
        if (resource.subtitles == undefined) { return; }
        if (resource.subtitles.length < this._subtitleIndex + 1) { return; }

        var subtitle = resource.subtitles[this._subtitleIndex];

        var options =
        {
            url: subtitle.src,
            success: function (text)
            {
                var nodes = $(text).find("add");
                var subtitle = $("div#repeat div.subtitle");
                var uls = subtitle.find("ul.subtitle");
                var template = uls.children("li.template").clone().attr("class", "item").show();
                var item = null;

                $.each(nodes, function (i, node)
                {
                    node = $(node);
                    item = template.clone().appendTo(uls);
                    item.children("span.start").text(node.attr("start"));
                    item.children("span.end").text(node.attr("end"));
                    item.children("p.text").text(node.text());
                    item.attr("index", i);
                });

                _this._resizeSubtitle(subtitle, subtitle.width(), subtitle.height());
            },
            error: function (error)
            {

            }
        };

        $.getFile(options);
    },
    _generateVolumnSlider: function ()
    {
        var _this = this;

        return $("div.volumn").slider(
        {
            value: _this._getVolumn(),
            mousedown: function () { _this.__operating = true; },
            mouseup: function () { _this.__operating = false; },
            change: function (value) { _this._setVolumn(value); }
        });
    },
    _generateProgressSlider: function (start, current, end)
    {
        var _this = this;
        var video = $("video").get(0);
        var setCurrentTime = function (value)
        {
            if (video.readyState > 0)
            {
                video.currentTime = value;
            }
        };

        return $("div.progress").slider(
        {
            start: start,
            end: end,
            value: current,
            mousedown: function (value) { setCurrentTime(value); _this.__operating = true; },
            mouseup: function () { _this.__operating = false; },
            mousemove: setCurrentTime
        });
    },
    _getVolumn: function (volumn)
    {
        return $("video").get(0).volume;
    },
    _setVolumn: function (volumn)
    {
        $("video").get(0).volume = volumn;
    },
    _keyup: function (sender, event)
    {
        switch (event.keyCode)
        {
            case 32:
                if (parseInt($("div#repeat").css("left")) < $(window).width()) { return; }
                this._toggleState();
                break;
            default:
                break;
        }
    },
    _mousedown: function(sender, event)
    {
        sender = $(sender);
        this.__movestart = { sender: sender, event: event };

        switch (sender.attr("id"))
        {
            case "outcrop":
                this.__movestart.width = sender.width();
                sender.unbind("mouseup").mouseup(function () { $(this).animate({ marginLeft: -this.breadth, width: this.breadth }); });
                break;
        }
    },
    _mouseup: function(sender, event)
    {
        this.__movestart = null;
    },
    _mousemove: function (sender, event)
    {
        if (this.__movestart == null) { return; }
        sender = $(sender);

        var _sender = this.__movestart.sender;
        var _event = this.__movestart.event;

        switch (this.__movestart.sender.attr("id"))
        {
            case "outcrop":
                var width = this.__movestart.width;
                var breadth = _sender.get(0).breadth;
                var offset = _event.pageX - event.pageX;

                if (width + offset >= _sender.height())
                {
                    sender.trigger("mouseup");
                    _sender.unbind("mouseup");
                    this._togglePanel(false);
                    this._toggleRepeat(true);
                }
                else
                {
                    _sender.css({ marginLeft: -(width + offset), width: width + offset });
                }
                break;
        }
    },
    _click: function (sender, event)
    {
        var _this = this;
        sender = $(sender);

        switch (sender.attr("for"))
        {
            case "video":
                if (parseInt($("div#repeat").css("left")) < $(window).width()) { return; }
                this._togglePanel();
                break;
            case "li.subtitle":
                var list = sender.parent().children("li:visible");
                list.removeClass("selected");
                sender.addClass("selected");
                this._refreshSubtitle(list);
                break;
            case "a.subtitle":
                event.stopPropagation();

                var li = sender.parent();
                var list = li.parent().children("li:visible");
                var selected = list.filter(".selected");
                if (selected.length == 0) { return; }

                var current = parseInt(li.attr("index"));
                var first = parseInt(selected.first().attr("index"));
                var last = parseInt(selected.last().attr("index"));
                var start = 0, end = 0;

                if (sender.hasClass("plus"))
                {
                    if (current < first) { start = current; end = first - 1; }
                    else if (current > end) { start = last + 1; end = current; }

                    for (var i = start; i <= end; i++) { list.eq(i).addClass("selected"); }
                }
                else if (sender.hasClass("minus"))
                {
                    if (sender.hasClass("start")) { start = first; end = current - 1; }
                    else if (sender.hasClass("end")) { start = current + 1; end = last; }

                    for (var i = start; i <= end; i++) { list.eq(i).removeClass("selected"); }
                }
                else
                {
                    return;
                }

                this._refreshSubtitle(list);
                break;
            default:
                break;
        }
    },
    _refreshSubtitle: function (list)
    {
        list = list || $("div#repeat ul.subtitle>li");
        if (list.length <= 1) { return; }

        $("div#repeat a.selector").removeClass("drag plus minus");
        var found = false, selected = false;

        $.each(list, function (i, li)
        {
            selected = (li = $(li)).hasClass("selected");

            if (selected)
            {
                switch (i)
                {
                    case 0:
                        li.find("a.end").addClass(list.eq(i + 1).hasClass("selected") ? "minus" : "drag");
                        break;
                    case list.length - 1:
                        li.find("a.start").addClass(list.eq(i - 1).hasClass("selected") ? "minus" : "drag");
                        break;
                    default:
                        li.find("a.start").addClass(list.eq(i - 1).hasClass("selected") ? "minus" : "drag");
                        li.find("a.end").addClass(list.eq(i + 1).hasClass("selected") ? "minus" : "drag");
                        break;
                }

                found = true;
            }
            else
            {
                li.find("a." + (found ? "end" : "start")).addClass("plus");
            }
        });
    },
    _togglePanel: function (visible)
    {
        // 分析优化算法, 用一个 timer
        var _this = this;
        if (this.__togglingPanel) { return; }

        var duration = 800;
        var header = $("div#header");
        var control = $("div#control");
        var repeatOutcrop = $("a#outcrop");
        var openToggling = function () { _this.__togglingPanel = false; };

        visible = visible == undefined ? (!header.is(":visible")) : visible;
        clearTimeout(this._timer.hideTogglePanel);
        clearTimeout(this._timer.waitOperatingComplete);

        if (visible)
        {
            header.show().animate({ top: 0 }, duration, openToggling);
            control.show().animate({ marginTop: -2 * control.height() }, duration);
            repeatOutcrop.animate({ marginLeft: -repeatOutcrop.get(0).breadth, width: repeatOutcrop.get(0).breadth }, duration);

            this.__togglingPanel = true;

            if (!$("video").get(0).paused)
            {
                this._timer.hideTogglePanel = setTimeout(function () { _this._togglePanel(false); }, 3 * duration);
            }
        }
        else
        {
            if (this.__operating)
            {
                this._timer.waitOperatingComplete = setTimeout(function () { _this._togglePanel(false); }, 3 * duration);
                return;
            }

            header.animate({ top: -header.height() }, duration, function () { $(this).hide(); openToggling(); });
            control.animate({ marginTop: 0 }, duration, function () { $(this).hide(); });
            repeatOutcrop.animate({ marginLeft: 0, width: 0 }, duration);
            this.__togglingPanel = true;
        }
    },
    _toggleState: function ()
    {
        $("a.play").click();
    },
    _toggleRepeat: function (visible)
    {
        var repeat = $("div#repeat");
        repeat.animate({ left: visible === true ? (0.5 * ($(window).width() - repeat.width())) : $(window).width() }, 800);
    },
    _ended: function (sender, event)
    {
        sender.pause();
        sender.currentTime = 0;
        this._toggleState();
    },
    _getShadow: function (offset, range, color, inset)
    {
        return offset + "px " + offset + "px " + range + "px " + color + (inset ? " inset" : "");
    },
    _resizePage: function (width, height)
    {
        var video = $("video");
        var header = $("div#header");
        var control = $("div#control");
        var repeat = $("div#repeat");
        var setting = $("div#setting");

        video.css({ height: height, width: width });
        header.css({ height: parseInt((height + width) * 0.02), width: width }).css({ top: -header.height() });
        control.css({ width: parseInt((height + width) * 0.22) }).css({ height: parseInt(control.width() * 0.2) });
        repeat.css({ height: parseInt(height * 0.65) }).css({ width: parseInt(repeat.height() * 2) }).css({ left: width, top: parseInt(0.5 * (height - repeat.height())) });

        this._resizeHeader(header, header.width(), header.height());
        this._resizeControl(control, control.width(), control.height());
        this._resizeRepeat(repeat, repeat.width(), repeat.height());
    },
    _resizeHeader: function (header, width, height)
    {
        var progress = header.children("div.progress");
        var timer = header.children("span.timer");
        var back = header.children("a.back");
        var setting = header.children("a.setting");

        var progressWidth = parseInt(width * 0.8);
        var timerWidth = parseInt(width * 0.05);
        var buttonMargin = parseInt(width * 0.005);

        progress.css({ height: parseInt(height * 0.2), width: progressWidth }).css({ marginTop: parseInt(0.5 * (height - progress.height())) });
        timer.css({ fontSize: height * 0.3, height: height, lineHeight: height + "px", width: timerWidth });
        back.css({ height: parseInt(height * 0.7), marginLeft: buttonMargin, marginRight: buttonMargin, width: parseInt(0.5 * (width - 2 * timerWidth - 4 * buttonMargin - progressWidth)) });
        back.css({ lineHeight: back.height() + "px", marginTop: parseInt(0.5 * (height - back.height())) });
        setting.css({ height: back.height(), lineHeight: back.css("line-height"), marginLeft: buttonMargin, marginRight: buttonMargin, marginTop: back.css("margin-top"), width: back.width() });
    },
    _resizeControl: function (control, width, height)
    {
        var background = control.children("div.background");
        var row = control.children("div.button");
        var buttons = row.children("a.button");
        var volumn = control.children("div.volumn");

        background.css({ opacity: background.css("opacity") });
        row.css({ height: parseInt(height * 0.5), width: parseInt(width * 0.06) * 2 * buttons.length });
        buttons.css({ height: parseInt(row.height() * 0.8) }).css({ width: buttons.height() });
        buttons.css({ margin: (row.width() / 3 - buttons.width()) * 0.5, marginTop: parseInt(0.5 * (row.height() - buttons.height())), marginBottom: 0 });
        volumn.css({ height: parseInt(row.height() * 0.2), width: parseInt(width * 0.7) });
        volumn.css({ borderRadius: volumn.height(), marginTop: parseInt(0.5 * (height * 0.5 - volumn.height())) });
    },
    _resizeRepeat: function (repeat, width, height)
    {
        var outcrop = repeat.children("a.outcrop");
        var subtitle = repeat.children("div.subtitle");
        var close = repeat.children("a.close");
        var line = repeat.children("div.line");

        repeat.css({ borderRadius: parseInt(width * 0.01), boxShadow: this._getShadow(0, width * 0.015, "rgba(0,0,0,0.5)") });
        outcrop.css({ height: parseInt($(window).height() * 0.15) }).css({ marginTop: parseInt(0.5 * (height - outcrop.height())) }).get(0).breadth = parseInt(outcrop.height() * 0.06);
        outcrop.css({ "border-bottom-left-radius": outcrop.height() * 0.2 }).css({ "border-top-left-radius": outcrop.css("border-bottom-left-radius") })
        subtitle.css({ marginTop: parseInt(height * 0.06) }).css({ height: height - 2 * parseInt(subtitle.css("margin-top")) });
        subtitle.css({ marginBottom: subtitle.css("margin-top"), width: width - height + subtitle.height() });
        line.css({ marginTop: subtitle.css("margin-top"), width: 1 }).css({ height: height - 2 * parseInt(line.css("margin-top")) });
        line.css({ marginLeft: (function (m) { return function () { return $(this).hasClass("left") ? m : (width - m - 1) }; })(Math.floor(width * 0.15)) });
        close.css({ width: parseInt(width * 0.02), marginTop: parseInt(subtitle.css("margin-top")) - height }).css({ height: 3 * close.width() });
    },
    _resizeSubtitle: function (subtitle, width, height)
    {
        var ul = subtitle.find("ul.subtitle");
        var rows = ul.children("li.item");
        var text = subtitle.find("p.text");
        var circles = subtitle.find("p.circle");
        var time = subtitle.find("span.time");
        var selector = subtitle.find("a.selector");
        var line = $("div#repeat div.line.left");

        rows.css({ borderRadius: parseInt(height * 0.02), height: parseInt(height * 0.15), marginBottom: Math.ceil(height * 0.005), width: parseInt(height * 1) });
        text.css({ lineHeight: rows.height() + "px" });
        circles.css({ height: parseInt(height * 0.007) * 2 }).css({ marginTop: -parseInt(0.5 * (rows.height() + circles.height())), width: circles.height() });
        time.css({ height: parseInt(height * 0.012) * 2 + 1, fontSize: parseInt(height * 0.025) }).css({ lineHeight: time.css("height"), marginTop: -parseInt(0.5 * (rows.height() + time.height())) });
        time.css({ width: line.offset().left - subtitle.offset().left + line.outerWidth() + Math.floor(0.5 * time.height()) });
        selector.css({ boxShadow: this._getShadow(0, height * 0.012, "rgba(0,0,0,1)"), height: parseInt(rows.width() * 0.07) }).css({ borderRadius: selector.height(), width: selector.height() });

        var circleMargin = -Math.ceil(circles.width() * 0.5);
        var timeMargin = -(rows.offset().left - subtitle.offset().left + parseInt(rows.css("border-left-width")));
        var selectorMargin = parseInt(rows.width() * 0.015);

        circles.each(function (i, e) { (e = $(e)).hasClass("start") ? e.css({ marginLeft: circleMargin }) : e.css({ marginRight: circleMargin }); });
        time.each(function (i, e) { (e = $(e)).hasClass("start") ? e.css({ marginLeft: timeMargin }) : e.css({ marginRight: timeMargin }); });
        selector.each(function (i, e) { (e = $(e)).hasClass("start") ? e.css({ marginLeft: selectorMargin, marginTop: (-rows.height() + selectorMargin) }) : e.css({ marginRight: selectorMargin, marginTop: -(selectorMargin + selector.height()) }); });
    }
};
