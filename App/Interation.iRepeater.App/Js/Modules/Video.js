var video =
{
    ready: function ()
    {
        var _this = this;

        $(window).resize(function () { _this._resizePage(); }).resize();
    },
    _resizePage: function ()
    {
        var video = $("video");
        var header = $("div.header");
        var control = $("div.control");
        var controlBg = control.children("div.bg");
        var controlRow = control.children("div.button");
        var controlButtons = controlRow.children("a.button");
        var pause = controlButtons.filter(function () { return $(this).hasClass("pause"); })
        var last = controlButtons.filter(function () { return $(this).hasClass("last"); })
        var next = controlButtons.filter(function () { return $(this).hasClass("next"); })
        var volumn = control.children("div.volumn");
        var repeat = $("div.repeat");
        var setting = $("div.setting");

        video.css({ height: $(window).height(), width: $(window).width() });
        header.css({ height: parseInt(($(window).height() + $(window).width()) * 0.02), width: $(window).width() });
        control.css({ width: parseInt(($(window).width() + $(window).height()) * 0.235) }).css({ height: parseInt(control.width() * 0.2) });
        controlBg.css({ opacity: controlBg.css("opacity") });
        controlRow.css({ height: parseInt(control.height() * 0.5), width: parseInt(control.width() * 0.06) * 2 * controlButtons.length });
        controlButtons.css({ height: parseInt(controlRow.height() * 0.7) }).css({ width: controlButtons.height() });
        controlButtons.css({ margin: (controlRow.width() / 3 - controlButtons.width()) * 0.5, marginTop: parseInt(0.5 * (controlRow.height() - controlButtons.height())), marginBottom: 0 });
        volumn.css({ height: parseInt(controlRow.height() * 0.2), width: parseInt(control.width() * 0.7) });
        volumn.css({ borderRadius: volumn.height(), marginTop: parseInt(0.5 * (control.height() * 0.5 - volumn.height())) });
        pause.css({ backgroundPositionX: -controlButtons.width() });
        last.css({ backgroundPositionX: -2 * controlButtons.width() });
        next.css({ backgroundPositionX: -3 * controlButtons.width() });

        control.css({ marginTop: -2 * control.height() });
    }
};
