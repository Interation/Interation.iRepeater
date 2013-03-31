(function ($)
{
    $.extend(
    {
        exists: function (array, rule)
        {
            if (typeof rule == "function")
            {
                var exists = false;
                $.each(array, function (i, e) { return !(exists = rule(i, e)); });
                return exists;
            }
        },
        convert: function (array, rule)
        {
            if (typeof rule == "function")
            {
                var result = [];
                $.each(array, function (i, e) { result.push(rule(i, e)); });
                return result;
            }
        },
        formatTime: function (seconds, milli)
        {
            var date = new Date(Math.round(seconds * 1000));

            var hours = date.getUTCHours();
            var minutes = date.getUTCMinutes();
            var seconds = date.getUTCSeconds();

            if (hours < 10) { hours = "0" + hours; }
            if (minutes < 10) { minutes = "0" + minutes; }
            if (seconds < 10) { seconds = "0" + seconds; }

            var formatted = hours + ":" + minutes + ":" + seconds;

            if (milli)
            {
                milli = date.getUTCMilliseconds();
                if (milli < 10) { milli = "00" + minutes; }
                if (milli < 100) { milli = "0" + minutes; }
                formatted += "." + milli;
            }

            return formatted;
        },
        reverseFormatTime: function (text)
        {
            var time = 0;
            var result = null;

            if (result = text.match(/(\d+):(\d{1,2}):(\d{1,2}).(\d{3})/))
            {
                time = parseInt(result[1]) * 3600 + parseInt(result[2]) * 60 + parseInt(result[3]) + parseInt(result[4]) * 0.001;
            }

            return time;
        }
    });

    $.fn.extend(
    {
        watermark: function (text)
        {
            this.focus(function () { if ($(this).hasClass("empty")) { $(this).removeClass("empty").val(""); } });
            this.blur(function () { if ($(this).val().length == 0) { $(this).addClass("empty").val(text); } }).blur();
            return this;
        }
    });
})(jQuery);
