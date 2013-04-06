var consoleService =
{
    start: function (callback)
    {
        settingService.getSettings(function (settings)
        {
            if (typeof callback == "function")
            {
                callback();
            }
        })
    }
};
