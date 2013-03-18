(function ($)
{
    $.extend(
    {
        exists: function (array, rule)
        {
            if (typeof rule == "function")
            {
                var exists = false;
                $.each(array, function (i, e) { return !(exists = rule.call($(e), i)); });
                return exists;
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
        },
        convert: function (rule)
        {
            if (typeof rule == "function")
            {
                var result = [];
                $.each(this, function (i, e) { result.push(rule.call($(e), i)); });
                return result;
            }
        }
    });
})(jQuery);
