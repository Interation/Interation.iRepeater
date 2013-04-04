var console =
{
    start: function (callback)
    {
        var json =
        {
            url: config.urls.settings,
            success: function (text)
            {
                config.settings = config.settings || {};

                $.each($(text).find("add"), function (i, item)
                {
                    item = $(item);
                    config.settings[item.attr("name")] = _this._getSettingValue(item);
                });
            },
            complete: function ()
            {
                if (typeof callback == "function")
                {
                    callback();
                }
            }
        };

        var _this = this;

        utility.storage.getFile(json);
    },
    _getSettingValue: function (node)
    {
        var type = node.attr("type");
        var value = node.attr("value");

        switch (type)
        {
            case "int":
                return parseInt(value);
            case "float":
                return parseFloat(value);
            default:
                return value;
        }
    }
};