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
