var video =
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
        $("div#control a.button").mousedown(function () { _this._toggleControllerActive(this, true); })
                                 .mouseup(function () { _this._toggleControllerActive(this, false); })
                                 .mouseover(function () { _this._toggleControllerActive(this, true); })
                                 .mouseout(function () { _this._toggleControllerActive(this, false); })
                                 .bind("drag", function () { return false; });
        $("div#control a.play").click(function (event) { _this._togglePaypuse(); });
        $("div#control a.toggler").click(function (event) { _this._toggleRepeatWindow(true); });
        $("div#control a.repeat").click(function (event) { _this._toggleRepeating(); });
        $("div#repeat a.close").click(function () { _this._toggleRepeatWindow(false); });
        $("div#repeat a.clear").click(function () { _this._clear(); });
        $("div#repeat a.confirm").click(function () { _this._repeat(); });
        $("div#repeat a.locate").click(function () { _this._locate(); });
        $("ul#caption").click(function (event) { _this._click(this, event); });

        this._resizePage($(window).width(), $(window).height());
        this._sliderVolumn = this._generateVolumnSlider();
        this._sliderProgress = this._generateProgressSlider();

        this._loading();
    },
    _loading: function ()
    {
        var json =
        {
            url: config.paths.product,
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

        fileSystem.getFile(json);
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
            setTimeout(function () { _this._captionUpdate(sender, _this._subtitle.dialogs); });
        }

        $("span.timer.current").text($.formatTime(sender.currentTime));
        $("span.timer.rest").text("-" + $.formatTime(sender.duration - sender.currentTime));

        this._sliderProgress.setValue(sender.currentTime);
    },
    _captionUpdate: function (video, dialogs)
    {
        if (dialogs == undefined) { return; }
        video = video || $("video").get(0);

        var _this = this;
        var time = video.currentTime;
        var caption = $("ul#caption");
        var subtitles = $("div#repeat ul.subtitle>li:visible");

        $.each(dialogs, function (i, e)
        {
            if (time >= e.start && time <= e.end)
            {
                subtitles.eq(i).addClass("located");
                if (caption.children("li[index=" + i + "]").length == 0)
                {
                    var li = $("<li></li>").attr("index", i).text(e.texts[0]).hide().appendTo(caption);
                    _this._resizeCaption(li, caption.width());
                    li.show();
                }
            }
            else
            {
                subtitles.eq(i).removeClass("located");
                caption.children("li[index=" + i + "]").remove();
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

        var _this = this;
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

        this._clear();

        this._toggleRepeatWindow(false, function ()
        {
            $("video").get(0).currentTime = _this._repeatParameter.start;
            _this._toggleRepeating(true);
            _this._togglePaypuse(true);
        });
    },
    _locate: function ()
    {
        var ul = $("div#repeat ul.subtitle");
        var located = ul.children("li.located");

        if (located.length > 0)
        {
            this._draggazillaSubtitle.scrollTo("y", ul.offset().top - located.offset().top);
            return;
        }

        var rows = ul.children("li:visible");
        var currentTime = video.currentTime || 0;

        for (var i = 0; i < rows.length; i++)
        {
            var row = $(rows[i]);

            var start = $.reverseFormatTime(row.find("span.start").text());
            if (start >= currentTime)
            {
                this._draggazillaSubtitle.scrollTo("y", ul.offset().top - row.offset().top);
                break;
            }
        }

    },
    _clear: function ()
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

        fileSystem.getFile(options);
    },
    _resolveSubtitles: function (text)
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
            bar: { backgroundColor: "rgba(0,0,0,0.5)", foregroundColor: "rgba(255,255,255,1)" },
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
            bar: { backgroundColor: "rgba(255,255,255,0.3)", foregroundColor: "rgba(255,255,255,1)" },
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
                holder: { color:"red", borderRadius: 0, color: "rgba(255,255,255,0.8)", length: width * 0.5, padding: 0.1 * width },
                opacity: 0.9
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
                var container = sender.parents("div.subtitle");
                var rows = container.find("li[index]:visible");

                this.__mousestart.rows = rows;
                this.__mousestart.offset = rows.offset();
                this.__mousestart.containerOffset = container.offset();
                this.__mousestart.for = sender.parent().hasClass("start") ? "start" : "end";
                this.__mousestart.margin =
                {
                    left: event.pageX - sender.offset().left - 0.5 * sender.width(),
                    top: event.pageY - sender.offset().top - 0.5 * sender.height()
                };
                this.__mousestart.scale =
                {
                    rowHeight: (rows.height() + parseFloat(rows.css("margin-bottom"))),
                    height: container.height(),
                    width: rows.width()
                };
                sender.addClass("active").css({ marginLeft: this.__mousestart.margin.left, marginTop: this.__mousestart.margin.top });
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
                var margin = this.__mousestart.margin;
                var offset = this.__mousestart.offset;
                var containerOffset = this.__mousestart.containerOffset;

                _sender.css({ marginLeft: margin.left + event.pageX - _event.pageX, marginTop: margin.top + event.pageY - _event.pageY });

                this._hoverSubtitles(rows);

                if ((event.pageX - offset.left) >= 0
                    && (event.pageX - offset.left) <= scale.width
                    && (event.pageY - containerOffset.top >= 0
                    && (event.pageY - containerOffset.top <= scale.height)))
                {
                    var index = Math.floor((event.pageY - offset.top) / scale.rowHeight);
                    if (index > rows.length - 1) { index = rows.length - 1; }
                    else if (index < 0) { index = 0; }

                    this._hoverSubtitles(rows, index, this.__mousestart.for == "end");
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
            case "caption":
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
        var minimum = 0, maximum = 0;

        if (positive)
        {
            if (startIndex <= index)
            {
                minimum = startIndex;
                maximum = index;
            }
            else
            {
                minimum = index;
                maximum = startIndex - 1;
            }
        }
        else
        {
            if (endIndex >= index)
            {
                minimum = index;
                maximum = endIndex;
            }
            else
            {
                minimum = endIndex + 1;
                maximum = index;
            }
        }

        for (var i = minimum; i <= maximum; i++)
        {
            list.eq(i).addClass("pre");
        }
    },
    _refreshSubtitles: function (list)
    {
        list = list || $("div#repeat ul.subtitle>li:visible");
        list.find("div.selector>a").removeClass("holder active").css({ marginLeft: 0, marginTop: 0 });

        if (list.length <= 1) { return; }

        var selected = list.filter(".selected");
        var first = selected.first();
        var last = selected.last();

        if (first.prev(":visible").length > 0 || first.get(0) != last.get(0)) { first.find("div.selector.start>a").addClass("holder"); }
        if (last.next(":visible").length > 0 || first.get(0) != last.get(0)) { last.find("div.selector.end>a").addClass("holder");; }
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
    _toggleRepeating: function (state)
    {
        var handler = $("div#control a.repeat");

        if (this._repeatParameter == undefined)
        {
            handler.addClass("disabled");
            return;
        }

        var video = $("video").get(0);
        handler.removeClass("disabled");

        this._repeating = state == undefined ? !this._repeating : state;

        if (this._repeating && this._repeatParameter != undefined)
        {
            video.currentTime = this._repeatParameter.start;
            handler.parents("li").addClass("highlight");
            this._togglePaypuse(true);
        }
        else
        {
            handler.parents("li").removeClass("highlight");
        }
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
                this._timer.hideTogglePanel = setTimeout(function () { _this._togglePanel(false); }, 10 * duration);
            }
        }
        else
        {
            if (this.__operating)
            {
                this._timer.waitOperatingComplete = setTimeout(function () { _this._togglePanel(false); }, 10 * duration);
                return;
            }

            header.animate({ top: -header.height() }, duration, function () { $(this).hide(); complete(); });
            control.animate({ marginTop: 0 }, duration, function () { $(this).hide(); });
            this.__togglingPanel = true;
        }
    },
    _toggleRepeatWindow: function (visible, callback)
    {
        var _this = this;
        var duration = 1000;
        var repeat = $("div#repeat");

        if (visible && $("div#header").is(":visible"))
        {
            this._togglePanel(false, function () { _this._toggleRepeatWindow(visible, callback); });
            return;
        }

        if (visible)
        {
            repeat.show().animate({ top: 0.5 * ($(window).height() - repeat.height()) }, duration, function ()
            {
                if (typeof callback == "function") { callback(); }
            });
        }
        else
        {
            repeat.animate({ top: $(window).height() }, duration, function ()
            {
                $(this).hide();
                if (typeof callback == "function") { callback(); }
                if ($("video").get(0).paused) { _this._togglePanel(true); }
            });
        }
    },
    _toggleControllerActive: function (sender, active)
    {
        sender = $(sender);
        sender.parents("ul.button").children().removeClass("active");
        if (sender.hasClass("disabled")) { return; }
        if (active) { sender.parents("li").addClass("active"); }
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
                sender.find("div.selector>a").mousedown(function (event) { _this._mousedown(this, event); return false; });
                break;
        }

    },
    _resizePage: function (width, height)
    {
        var video = $("video");
        var header = $("div#header");
        var control = $("div#control");
        var repeat = $("div#repeat");
        var caption = $("ul#caption");
        var setting = $("div#setting");

        video.css({ height: height, width: width });
        header.css({ height: parseInt((height + width) * 0.02), width: width }).css({ top: -header.height() });
        control.css({ width: parseInt((height + width) * 0.22) }).css({ height: parseInt(control.width() * 0.22) });
        repeat.css({ height: parseInt(height * 0.6) }).css({ width: parseInt(repeat.height() * 1.5) }).css({ left: parseInt(0.5 * (width - repeat.width())), top: height });
        repeat.css({ borderRadius: repeat.width() * 0.02, boxShadow: this._getShadow(0, width * 0.015, "rgba(0,0,0,0.5)") });
        caption.css({ bottom: parseInt(height * 0.1), textShadow: this._getShadow(0, height * 0.005, "rgba(0,0,0,1)"), width: width }).css({ left: parseInt(0.5 * (width - caption.width())) });

        this._resizeHeader(header, header.width(), header.height());
        this._resizeControl(control, control.width(), control.height());
        this._resizeRepeat(repeat, repeat.width(), repeat.height());
    },
    _resizeHeader: function (header, width, height)
    {
        var progress = header.children("div.progress");
        var timer = header.children("span.timer");
        var buttons = header.children("a.button");

        var progressWidth = parseInt(width * 0.75);
        var timerWidth = parseInt(width * 0.07);
        var buttonMargin = parseInt(width * 0.005);

        progress.css({ height: parseInt(height * 0.2), width: progressWidth }).css({ marginTop: parseInt(0.5 * (height - progress.height())) });
        timer.css({ fontSize: height * 0.28, height: height, lineHeight: height + "px", width: timerWidth });
        buttons.css({ borderRadius: parseInt(height * 0.15) });
        buttons.css({ fontSize: height * 0.26, height: parseInt(height * 0.7), marginLeft: buttonMargin, marginRight: buttonMargin, width: parseInt(0.5 * (width - 2 * timerWidth - 4 * buttonMargin - progressWidth)) });
        buttons.css({ lineHeight: buttons.css("height"), marginTop: parseInt(0.5 * (height - buttons.height())) });
    },
    _resizeControl: function (control, width, height)
    {
        var ul = control.children("ul.button");
        var li = ul.children("li");
        var cloud = li.children("div.cloud");
        var volumn = control.children("div.volumn");

        li.css({ height: parseInt(height * 0.5) }).css({ padding: "0px", width: li.height() });
        ul.css({ height: li.outerHeight(), width: li.outerWidth() * li.length });
        cloud.css({ marginLeft: -(li.width() * 0.17) }).css({ width: li.width() + 2 * parseInt(cloud.css("margin-left")) });
        cloud.css({ height: cloud.width(), marginTop: cloud.css("margin-left"), padding: -2 * parseInt(cloud.css("margin-left")) });
        volumn.css({ height: parseInt(ul.height() * 0.2), width: parseInt(width * 0.7) });
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

        var borderRadius = "0px " + height * 0.008 + "px " + height * 0.008 + "px 0px";

        close.css({ borderRadius: borderRadius, width: Math.floor(0.6 * parseInt(ul.css("padding-left"))), marginTop: parseInt(subtitle.css("margin-top")) - height }).css({ height: 2 * close.width() });
        confirm.css({ borderRadius: borderRadius, width: close.width() }).css({ height: 3 * confirm.width() }).css({ marginTop: -parseInt(subtitle.css("margin-bottom")) - confirm.height() });
        locate.css({ borderRadius: borderRadius, width: close.width() }).css({ height: 2 * locate.width() }).css({ marginTop: parseInt(confirm.css("margin-top")) - locate.height() - 0.5 * parseInt(ul.css("padding-left")) });
        clear.css({ width: close.width() }).css({ borderRadius: borderRadius, height: clear.width() }).css({ marginTop: parseInt(locate.css("margin-top")) - clear.height() - 0.5 * parseInt(ul.css("padding-left")) });
    },
    _resizeSubtitle: function (subtitle, width, height)
    {
        var ul = subtitle.find("ul.subtitle");
        var rows = subtitle.find("li.item");
        var text = subtitle.find("p.text");
        var time = subtitle.find("span.time");
        var start = time.filter(".start");
        var end = time.filter(".end");
        var selector = subtitle.find("div.selector");
        var holders = selector.children("a");
        var locate = subtitle.find("div.locate");

        rows.css({ borderRadius: parseInt(height * 0.02), height: parseInt(height * 0.15), marginBottom: Math.ceil(height * 0.005) }).last().css({ marginBottom: 0 });
        rows.css({ boxShadow: this._getShadow(rows.height() * 0.05, rows.height() * 0.2, "rgba(0,0,0,0.5)", true) });
        ul.css({ height: rows.length * (rows.height() + parseFloat(rows.css("margin-bottom"))) - parseInt(rows.css("margin-bottom")) });
        selector.css({ height: parseInt(rows.height() * 0.38) }).css({ borderRadius: selector.height(), width: selector.height() });
        holders.css({ borderRadius: selector.height(), boxShadow: this._getShadow(rows.height() * 0.02, rows.height() * 0.08, "rgba(0,0,0,0.5)"), height: selector.height(), width: selector.width() });
        time.css({ height: parseInt(height * 0.08), fontSize: parseInt(width * 0.015), padding: "0px " + parseInt(rows.height() * 0.75) + "px" }).css({ lineHeight: time.css("height") });
        text.css({ fontSize: parseInt(width * 0.016), height: rows.height(), lineHeight: rows.height() + "px", marginTop: -time.height() });
        end.css({ marginTop: -time.height() });
        locate.css({ height: parseInt(rows.height() * 0.5), marginLeft: parseInt(width * 0.05), marginTop: -(rows.height() * 0.6) }).css({ width: locate.height() });

        var selectorMargin = parseInt(rows.height() * 0.1);
        selector.each(function (i, e) { (e = $(e)).hasClass("start") ? e.css({ marginLeft: selectorMargin, marginTop: (-rows.height() + selectorMargin) }) : e.css({ marginRight: selectorMargin, marginTop: -(selectorMargin + selector.height()) }); });
    },
    _resizeCaption: function (caption, width)
    {
        caption.css({ height: width * 0.025, fontSize: width * 0.02 });
    }
};
