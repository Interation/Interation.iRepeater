var settingService =
{
    getSettings: function (callback)
    {
        var options =
        {
            url: config.paths.settings,
            success: function (text)
            {
                var settings = _this._resolveSettings(text);
                settings = _this._formatSettings(settings);
                settings = _this._overwriteSettings(config.settings, settings);
                config.settings = _this._settings = settings;

                if (typeof callback == "function")
                {
                    callback(_this._settings);
                }
            },
            error: function ()
            {
                _this._settings = config.settings;

                if (typeof callback == "function")
                {
                    callback(_this._settings);
                }
            }
        };

        var _this = this;

        fileSystem.getFile(options);
    },
    setSettings: function (key, value)
    {

    },
    _resolveSettings: function (text)
    {
        var match = null, pair = null;
        var regExp = /([^\r\n]+)=([^\r\n]+)/mg;
        var settings = {};

        if (match = text.match(regExp))
        {
            for (var i = 0; i < match.length; i++)
            {
                pair = match[i].split('=');
                settings[pair[0]] = pair[1];
            }
        }

        return settings;
    },
    _formatSettings: function (settings)
    {
        $.each(settings, function (key, value)
        {
            switch (key)
            {
                case "volume":
                    settings[key] = parseFloat(value);
                    break;
            }
        });

        return settings;
    },
    _overwriteSettings: function (origin, newly)
    {
        origin = origin || {};
        $.each(newly, function (key, value) { origin[key] = value; });
        return origin;
    }
};
