var video =
{
    init: function ()
    {
        var _this = this;

        $("a.play").click(function (event) { _this.play(this, event); });
        $("video").click(function (event) { _this._click(this, event); })
                  .bind("ended", function (event) { _this._ended(this, event); })
                  .bind("timeupdate", function (event) { _this._timeupdate(this, event); });
        $(window).keyup(function (event) { _this._keyup(this, event); });

        this._timer = {};
        this._loadingVideo(function (video) { _this._ready(video); });
    },
    _timeupdate: function (sender, event)
    {
        $("span.timer.current").text(this._formatTime(sender.currentTime));
        $("span.timer.rest").text("-" + this._formatTime(sender.duration - sender.currentTime));

        this._sliderProgress.setValue(sender.currentTime);
    },
    _ready:function(sender)
    {
        $("span.timer.current").text(this._formatTime(sender.currentTime));
        $("span.timer.rest").text("-" + this._formatTime(sender.duration));

        this._resizePage($(window).width(), $(window).height());
        this._sliderVolumn = this._generateVolumnSlider();
        this._sliderProgress = this._generateProgressSlider(0, sender.currentTime, sender.duration);
        this._togglePanel(true);
    },
    _formatTime: function (seconds)
    {
        var minutes = parseInt(seconds / 60);
        seconds = parseInt(seconds - 60 * minutes);
        if (seconds < 10) { seconds = "0" + seconds; }
        return minutes + ":" + seconds;
    },
    _loadingVideo: function (callback)
    {
        var _this = this;
        var video = $("video").get(0);

        this._timer.loading = setInterval(function ()
        {
            try
            {
                if (video.readyState > 0)
                {
                    callback(video);
                    clearInterval(_this._timer.loading);
                }
            }
            catch (e)
            {
                clearInterval(_this._timer.loading);
            }
        }, 0);
    },
    _generateVolumnSlider: function()
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
        var setCurrentTime = function (value) { video.currentTime = value; };

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
    _getVolumn :function(volumn)
    {
        return $("video").get(0).volume;
    },
    _setVolumn: function(volumn)
    {
        $("video").get(0).volume = volumn;
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
    _keyup: function (sender, event)
    {
        switch (event.keyCode)
        {
            case 32:
                this._toggleState();
                break;
            default:
                break;
        }
    },
    _click: function (sender, event)
    {
        var _this = this;

        switch (sender.tagName.toLowerCase())
        {
            case "video":
                this._togglePanel();
                break;
            default:
                break;
        }
    },
    _togglePanel: function (visible)
    {
        var _this = this;
        if (this.__togglingPanel) { return; }

        var duration = 800;
        var header = $("div.header");
        var control = $("div.control");
        var openToggling = function () { _this.__togglingPanel = false; };

        visible = visible == undefined ? (!header.is(":visible")) : visible;
        clearTimeout(this._timer.hideTogglePanel);
        clearTimeout(this._timer.waitOperatingComplete);

        if (visible)
        {
            header.show().animate({ top: 0 }, duration, openToggling);
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

            header.animate({ top: -header.height() }, duration, function () { $(this).hide(); openToggling(); });
            control.animate({ marginTop: 0 }, duration, function () { $(this).hide(); });
            this.__togglingPanel = true;
        }
    },
    _toggleState: function ()
    {
        $("a.play").click();
    },
    _ended: function (sender, event)
    {
        this.pause(sender, event);
        sender.currentTime = 0;
    },
    _resizePage: function (width, height)
    {
        var video = $("video");
        var header = $("div.header");
        var control = $("div.control");
        var repeat = $("div.repeat");
        var setting = $("div.setting");

        video.css({ height: height, width: width });
        header.css({ height: parseInt((height + width) * 0.02), width: width }).css({ top: -header.height() });
        control.css({ width: parseInt((height + width) * 0.22) }).css({ height: parseInt(control.width() * 0.2) });

        this._resizeHeader(header, header.width(), header.height());
        this._resizeControl(control, control.width(), control.height());
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
        setting.css({ height: back.height(), marginLeft: buttonMargin, marginRight: buttonMargin, marginTop: back.css("margin-top"), width: back.width() });
    },
    _resizeControl: function (control, width, height)
    {
        var bg = control.children("div.bg");
        var row = control.children("div.button");
        var buttons = row.children("a.button");
        var volumn = control.children("div.volumn");

        bg.css({ opacity: bg.css("opacity") });
        row.css({ height: parseInt(height * 0.5), width: parseInt(width * 0.06) * 2 * buttons.length });
        buttons.css({ height: parseInt(row.height() * 0.8) }).css({ width: buttons.height() });
        buttons.css({ margin: (row.width() / 3 - buttons.width()) * 0.5, marginTop: parseInt(0.5 * (row.height() - buttons.height())), marginBottom: 0 });
        volumn.css({ height: parseInt(row.height() * 0.2), width: parseInt(width * 0.7) });
        volumn.css({ borderRadius: volumn.height(), marginTop: parseInt(0.5 * (height * 0.5 - volumn.height())) });
    }
};
