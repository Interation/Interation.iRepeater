﻿var video =
{
    init: function ()
    {
        var _this = this;
        this._timer = {};

        $("video").click(function (event) { _this._click(this, event); })
                  .keydown(function () { return false; })
                  .bind("ended", function (event) { _this._ended(this, event); })
                  .bind("timeupdate", function (event) { _this._timeUpdate(this, event); });
        $(window).keyup(function (event) { _this._keyup(this, event); })
                 .mousemove(function (event) { _this._mousemove(this, event); })
                 .mouseup(function (event) { _this._mouseup(this, event); })
                 .bind("selectstart", function () { return false; });
        $("div#control a.play").click(function (event) { _this._togglePaypuse(); });
        $("div#control a.toggler").click(function (event) { _this._toggleRepeatWindow(true); });
        $("div#control a.repeat").click(function (event) { _this._toggleRepeating(); });
        $("div#repeat a.close").click(function () { _this._toggleRepeatWindow(false); });
        $("div#repeat a.clear").click(function () { _this._clear(); });
        $("div#repeat a.confirm").click(function () { _this._repeat(); });

        this._resizePage($(window).width(), $(window).height());
        this._sliderVolumn = this._generateVolumnSlider();
        this._sliderProgress = this._generateProgressSlider();

        this._loading();
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
                _this._loadingVideo(product);
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
        var match = null;
        return (match = location.href.match(/(\?|$)id=(\d+)/i)) ? match[2] : 0;
    },
    _timeUpdate: function (sender, event)
    {
        var _this = this;

        if (this._repeating && this._repeatParameter != undefined)
        {
            if (sender.currentTime < this._repeatParameter.start || sender.currentTime > this._repeatParameter.end)
            {
                sender.currentTime = this._repeatParameter.start;
            }
        }

        if (this._subtitle != undefined && this._subtitle.dialogs != undefined)
        {
            setTimeout(function () { _this._subtitleUpdate(sender, _this._subtitle.dialogs); });
        }

        $("span.timer.current").text($.formatTime(sender.currentTime));
        $("span.timer.rest").text("-" + $.formatTime(sender.duration - sender.currentTime));

        this._sliderProgress.setValue(sender.currentTime);
    },
    _subtitleUpdate: function (video, dialogs)
    {
        if (dialogs == undefined) { return; }
        video = video || $("video").get(0);

        var time = video.currentTime;
        var subtitle = $("ul#subtitle");
        var selectors = $("div#repeat ul.subtitle>li:visible");

        $.each(dialogs, function (i, e)
        {
            if (time >= e.start && time <= e.end)
            {
                selectors.eq(i).addClass("located");
                if (subtitle.children("li[index=" + i + "]").length == 0)
                {
                    var li = $("<li></li>").attr("index", i).text(e.texts[0]).hide().appendTo(subtitle);
                    var height = li.height();
                    li.css({ height: 0 }).show().animate({ height: height });
                }
            }
            else
            {
                selectors.eq(i).removeClass("located");
                subtitle.children("li[index=" + i + "]").animate({ opacity: 0 }, function () { $(this).animate({ height: 0 }, function () { $(this).remove(); }); });
            }
        });
    },
    _repeat: function ()
    {
        var rows = $("div#repeat ul.subtitle>li.selected");

        if (rows.length == 0)
        {
            alert("No Sentences Selected");
            return;
        }

        var dialogs = this._subtitle.dialogs;
        var start = parseInt(rows.first().attr("index"));
        var end = parseInt(rows.last().attr("index"));

        this._repeatParameter =
        {
            start: dialogs[start].start,
            end: dialogs[start].end
        };

        for (var i = start + 1; i <= end; i++)
        {
            if (dialogs[i].start < this._repeatParameter.start) { this._repeatParameter.start = dialogs[i].start; }
            if (dialogs[i].end > this._repeatParameter.end) { this._repeatParameter.end = dialogs[i].end; }
        }

        $("video").get(0).currentTime = this._repeatParameter.start;

        this._toggleRepeating(true);
        this._togglePaypuse(true);
        this._toggleRepeatWindow(false);
    },
    _clear: function()
    {
        var rows = $("div#repeat ul.subtitle>li.selected").removeClass("selected");
        this._refreshSubtitles();
    },
    _loadingVideo: function (product, index)
    {
        index = index || 0

        if (product == undefined) { return; }
        if (product.resources == undefined) { return; }
        if (index > product.resources.length - 1) { return; }

        var resource = product.resources[index];
        if (resource == undefined) { return; }

        this._resource = resource;
        this._resourceIndex = index;

        var _this = this;
        var video = $("video").get(0);
        video.src = resource.src;
        video.type = resource.type;

        this._loadingSubtitle(resource);

        this._timer.loading = setInterval(function ()
        {
            try
            {
                if (video.readyState > 0)
                {
                    $("span.timer.current").text($.formatTime(video.currentTime));
                    $("span.timer.rest").text("-" + $.formatTime(video.duration));

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
    _loadingSubtitle: function (resource, index)
    {
        index = index || 0;

        if (resource == undefined) { return; }
        if (resource.subtitles == undefined) { return; }
        if (index > resource.subtitles.length - 1) { return; }

        var _this = this;
        var subtitle = resource.subtitles[index];

        var options =
        {
            url: subtitle.src,
            success: function (text)
            {
                _this._subtitle = subtitle;
                _this._subtitle.dialogs = _this._resolveSubtitles(text);
                _this._subtitleIndex = index;

                var div = $("div#repeat div.subtitle");
                var ul = div.children("ul.subtitle");
                var template = ul.children("li.template").clone().attr("class", "item").show();
                var item = undefined;

                $.each(_this._subtitle.dialogs, function (i, dialog)
                {
                    item = template.clone();
                    item.children("span.start").text($.formatTime(dialog.start, true));
                    item.children("span.end").text($.formatTime(dialog.end, true));
                    item.children("p.text").text(dialog.texts[0]);
                    item.attr("index", i);
                    item.appendTo(ul);
                });

                _this._resizeSubtitle(div, div.width(), div.height());
                _this._draggazillaSubtitle = _this._generateSubtitleDraggazilla();
                _this._bindEvents(ul);
            },
            error: function (error)
            {

            }
        };

        $.getFile(options);
    },
    _resolveSubtitles: function(text)
    {
        var _this = this;
        var nodes = $(text).find("add");
        var subtitle = [];

        $.each(nodes, function (i, node)
        {
            node = $(node);

            var texts = [];
            var ps = node.children("p");
            if (ps.length == 0) { texts.push(node.text()); }
            else { ps.each(function (i, p) { texts.push($(p).text()); }); }

            subtitle.push(
            {
                start: $.reverseFormatTime(node.attr("start")),
                end: $.reverseFormatTime(node.attr("end")),
                texts: texts
            });
        });

        return subtitle;
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
    _generateSubtitleDraggazilla: function ()
    {
        var width = parseInt($("div#repeat ul.subtitle").css("padding-right"));

        var options =
        {
            scrollbar:
            {
                line: { color: "rgba(255,255,255,0.5)", margin: Math.floor(width * 0.5), width: 1 },
                holder: { borderRadius: width, color: "#000000", padding: 0.3 * width }
            }
        };

        return $("ul.subtitle").draggazilla(options);
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
                if ($("div#repeat").is(":visible")) { return; }
                this._togglePaypuse();
                break;
            default:
                break;
        }
    },
    _mousedown: function (sender, event)
    {
        var _this = this;
        sender = $(sender);
        this.__mousestart = { sender: sender, event: event };

        switch (sender.attr("for"))
        {
            case "li.subtitle":
                this.__mousestart.moved = false;
                break;
            case "a.selector.subtitle":
                this.__mousestart.top = (function (t) { return isNaN(t) ? 0 : t; })(parseFloat(sender.css("top")));
                this.__mousestart.left = (function (l) { return isNaN(l) ? 0 : l; })(parseFloat(sender.css("left")));
                this.__mousestart.rows = sender.parents("ul.subtitle").children("li[index]:visible");
                this.__mousestart.scale = { height: (this.__mousestart.rows.height() + parseFloat(this.__mousestart.rows.css("margin-bottom"))), width: this.__mousestart.rows.width() };
                this.__mousestart.offset = this.__mousestart.rows.offset();
                break;
        }
    },
    _mousemove: function (sender, event)
    {
        if (this.__mousestart == undefined)
        {
            return;
        }

        var _this = this;
        var _sender = this.__mousestart.sender || {};
        var _event = this.__mousestart.event || {};

        sender = $(sender);

        switch ($(_sender).attr("for"))
        {
            case "li.subtitle":
                this.__mousestart.moved = true;
                break;
            case "a.selector.subtitle":
                var rows = this.__mousestart.rows;
                var scale = this.__mousestart.scale;
                var offset = this.__mousestart.offset;
                var top = this.__mousestart.top + event.pageY - _event.pageY;
                var left = this.__mousestart.left + event.pageX - _event.pageX;

                _sender.css({ left: left, top: top });

                this._hoverSubtitles(rows);

                if ((event.pageX - offset.left) >= 0 && (event.pageX - offset.left) <= scale.width)
                {
                    var index = Math.floor((event.pageY - offset.top) / scale.height);
                    if (index > rows.length - 1) { index = rows.length - 1; }
                    else if (index < 0) { index = 0; }

                    this._hoverSubtitles(rows, index, _sender.hasClass("end"));
                }

                break;
        }
    },
    _mouseup: function (sender, event)
    {
        if (this.__mousestart == undefined)
        {
            return;
        }

        var _this = this;
        var _sender = this.__mousestart.sender;
        var _event = this.__mousestart.event;

        sender = $(sender);

        switch ($(_sender).attr("for"))
        {
            case "li.subtitle":
                if (this.__mousestart.moved == false)
                {
                    var list = sender.parent().children("li:visible");
                    list.removeClass("selected");
                    sender.addClass("selected");
                    this._refreshSubtitles(list);
                }
                break;
            case "a.selector.subtitle":
                var list = _sender.parents("ul.subtitle").children("li:visible");
                var pre = list.filter(".pre");
                if (pre.length > 0)
                {
                    list.removeClass("selected");
                    pre.removeClass("pre").addClass("selected");
                }
                this._refreshSubtitles(list);
                break;
        }

        this.__mousestart = undefined;
    },
    _click: function (sender, event)
    {
        var _this = this;
        sender = $(sender);

        switch (sender.attr("for"))
        {
            case "video":
                if ($("div#repeat").is(":visible")) { return; }
                this._togglePanel();
                break;
            default:
                break;
        }
    },
    _hoverSubtitles: function (list, index, positive)
    {
        list = list || $("div#repeat ul.subtitle>li:visible");
        list.removeClass("pre");
        if (index == undefined) { return; }

        var selected = list.filter(".selected");
        if (selected.length <= 0) { return; }

        var startIndex = parseInt(selected.first().attr("index"));
        var endIndex = parseInt(selected.last().attr("index"));
        var minimum = positive ? startIndex : Math.min(index, endIndex);
        var maximum = positive ? Math.max(index, startIndex) : endIndex;

        for (var i = minimum; i <= maximum; i++)
        {
            list.eq(i).addClass("pre");
        }
    },
    _refreshSubtitles: function (list)
    {
        list = list || $("div#repeat ul.subtitle>li:visible");
        list.find("a.selector").removeClass("holder").css({ left: 0, top: 0 });

        if (list.length <= 1) { return; }

        var found = false, selected = false;

        $.each(list, function (i, li)
        {
            li = $(li);
            selected = li.hasClass("selected");
            if (!selected) { return !found; }

            switch (i)
            {
                case 0:
                    li.find("a.selector." + (li.next().hasClass("selected") ? "start" : "end")).addClass("holder");
                    break;
                case list.length - 1:
                    li.find("a.selector." + (li.prev().hasClass("selected") ? "end" : "start")).addClass("holder");
                    break;
                default:
                    if (!li.next().hasClass("selected")) { li.find("a.selector.end").addClass("holder"); }
                    if (!li.prev().hasClass("selected")) { li.find("a.selector.start").addClass("holder"); }
                    break;
            }

            found = true;
        });
    },
    _togglePanel: function (visible, callback)
    {
        // 分析优化算法, 用一个 timer
        var _this = this;
        if (this.__togglingPanel) { return; }

        var duration = 600;
        var header = $("div#header");
        var control = $("div#control");

        var complete = function ()
        {
            _this.__togglingPanel = false;
            if (typeof callback == "function") { callback(); }
        };

        visible = visible == undefined ? (!header.is(":visible")) : visible;
        clearTimeout(this._timer.hideTogglePanel);
        clearTimeout(this._timer.waitOperatingComplete);

        if (visible)
        {
            header.show().animate({ top: 0 }, duration, complete);
            control.show().animate({ marginTop: -2 * control.height() }, duration);
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

            header.animate({ top: -header.height() }, duration, function () { $(this).hide(); complete(); });
            control.animate({ marginTop: 0 }, duration, function () { $(this).hide(); });
            this.__togglingPanel = true;
        }
    },
    _togglePaypuse: function (state)
    {
        var video = $("video").get(0);
        var handler = $("div#control a.play");
        var play = (state == undefined) ? video.paused : state;

        if (play)
        {
            video.play();
            handler.removeClass("paused");
            this._togglePanel(false);
        }
        else
        {
            video.pause();
            handler.addClass("paused");
            this._togglePanel(true);
        }
    },
    _toggleRepeating: function(state)
    {
        if (this._repeatParameter == undefined)
        {
            return;
        }

        var video = $("video").get(0);
        var handler = $("div#control a.repeat");

        this._repeating = state == undefined ? !this._repeating : state;

        if (this._repeating && this._repeatParameter != undefined)
        {
            video.currentTime = this._repeatParameter.start;
            handler.addClass("repeating");
        }
        else
        {
            handler.removeClass("repeating");
        }
    },
    _toggleRepeatWindow: function (visible)
    {
        var _this = this;
        var duration = 600;
        var repeat = $("div#repeat");

        if (visible && $("div#header").is(":visible"))
        {
            this._togglePanel(false, function () { _this._toggleRepeatWindow(visible); });
            return;
        }

        if (visible)
        {
            repeat.show().animate({ top: 0.5 * ($(window).height() - repeat.height()) }, duration);
        }
        else
        {
            repeat.animate({ top: $(window).height() }, duration, function ()
            {
                $(this).hide();
                if ($("video").get(0).paused) { _this._togglePanel(true); }
            });
        }
    },
    _ended: function (sender, event)
    {
        sender.pause();
        sender.currentTime = 0;
        this._togglePaypuse(false);
    },
    _getShadow: function (offset, range, color, inset)
    {
        return offset + "px " + offset + "px " + range + "px " + color + (inset ? " inset" : "");
    },
    _bindEvents: function (sender)
    {
        var _this = this;

        switch (sender.attr("for"))
        {
            case "ul.subtitle":
                sender.children("li").mousedown(function (event) { _this._mousedown(this, event); })
                                     .mouseup(function (event) { _this._mouseup(this, event); });
                sender.find("a.selector").mousedown(function (event) { _this._mousedown(this, event); return false; });
                break;
        }

    },
    _resizePage: function (width, height)
    {
        var video = $("video");
        var header = $("div#header");
        var control = $("div#control");
        var repeat = $("div#repeat");
        var subtitle = $("ul#subtitle");
        var setting = $("div#setting");

        video.css({ height: height, width: width });
        header.css({ height: parseInt((height + width) * 0.02), width: width }).css({ top: -header.height() });
        control.css({ width: parseInt((height + width) * 0.22) }).css({ height: parseInt(control.width() * 0.2) });
        repeat.css({ height: parseInt(height * 0.8) }).css({ width: parseInt(repeat.height() * 1.2) }).css({ left: parseInt(0.5 * (width - repeat.width())), top: height });
        repeat.css({ boxShadow: this._getShadow(0, width * 0.015, "rgba(0,0,0,0.5)") });
        subtitle.css({ bottom: parseInt(height * 0.1), textShadow: this._getShadow(0, height * 0.005, "rgba(0,0,0,1)"), width: parseInt(width * 0.5) }).css({ left: parseInt(0.5 * (width - subtitle.width())) });

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
        var close = repeat.children("a.close");
        var confirm = repeat.children("a.confirm");
        var locate = repeat.children("a.locate");
        var clear = repeat.children("a.clear");
        var subtitle = repeat.children("div.subtitle");
        var ul = subtitle.find("ul.subtitle");

        subtitle.css({ margin: parseInt(height * 0.06) + "px 0px" }).css({ height: height - 2 * parseInt(subtitle.css("margin-top")) });
        subtitle.css({ width: width - parseInt(subtitle.css("margin-left")) - parseInt(subtitle.css("margin-right")) });
        ul.css({ padding: "0px " + (parseInt(width * 0.025) * 2 + 1) + "px" }).css({ width: (subtitle.width() - 2 * parseInt(ul.css("padding-left"))) });

        var borderRadius = "0px " + height * 0.01 + "px " + height * 0.01 + "px 0px";

        close.css({ borderRadius: borderRadius, width: Math.floor(0.7 * parseInt(ul.css("padding-left"))), marginTop: parseInt(subtitle.css("margin-top")) - height }).css({ height: 2 * close.width() });
        confirm.css({ borderRadius: borderRadius, width: close.width() }).css({ height: 3 * confirm.width() }).css({ marginTop: -parseInt(subtitle.css("margin-bottom")) - confirm.height() });
        locate.css({ borderRadius: borderRadius, width: close.width() }).css({ height: 2 * locate.width() }).css({ marginTop: parseInt(confirm.css("margin-top")) - locate.height() - 0.5 * parseInt(ul.css("padding-left")) });
        clear.css({ width: confirm.width() }).css({ borderRadius: borderRadius, height: clear.width() }).css({ marginTop: parseInt(locate.css("margin-top")) - clear.height() - 0.5 * parseInt(ul.css("padding-left")) });
    },
    _resizeSubtitle: function (subtitle, width, height)
    {
        var ul = subtitle.find("ul.subtitle");
        var rows = subtitle.find("li.item");
        var text = subtitle.find("p.text");
        var time = subtitle.find("span.time");
        var start = time.filter(".start");
        var end = time.filter(".end");
        var selector = subtitle.find("a.selector");

        rows.css({ borderRadius: parseInt(height * 0.02), height: parseInt(height * 0.15), marginBottom: Math.ceil(height * 0.005) }).last().css({ marginBottom: 0 });
        rows.css({ boxShadow: this._getShadow(rows.height() * 0.05, rows.height() * 0.2, "rgba(0,0,0,0.5)", true) });
        ul.css({ height: rows.length * (rows.height() + parseFloat(rows.css("margin-bottom"))) - parseInt(rows.css("margin-bottom")) });
        selector.css({ boxShadow: this._getShadow(rows.height() * 0.02, rows.height() * 0.08, "rgba(0,0,0,0.5)"), height: parseInt(rows.height() * 0.38) }).css({ borderRadius: selector.height(), width: selector.height() });
        time.css({ height: parseInt(height * 0.042), fontSize: parseInt(height * 0.02), padding: "0px " + parseInt(rows.height() * 0.75) + "px" }).css({ lineHeight: time.css("height") });
        text.css({ fontSize: parseInt(height * 0.022), height: rows.height(), lineHeight: rows.height() + "px", marginTop: -time.height() });
        end.css({ marginTop: -time.height() });

        var selectorMargin = parseInt(rows.height() * 0.1);
        selector.each(function (i, e) { (e = $(e)).hasClass("start") ? e.css({ marginLeft: selectorMargin, marginTop: (-rows.height() + selectorMargin) }) : e.css({ marginRight: selectorMargin, marginTop: -(selectorMargin + selector.height()) }); });
    }
};
