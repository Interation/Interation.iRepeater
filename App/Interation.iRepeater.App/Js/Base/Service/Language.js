var language =
{
    getValue: function (key)
    {
        return config.lang[key][config.settings.language];
    },
    setLanguage: function (language, success, error)
    {
        var options =
        {
            url: config.urls.settings,
            success: function (text)
            {


                if (typeof success == "function")
                {
                    success();
                }
            },
            error: function (response)
            {
                if (typeof error == "function")
                {
                    error();
                }
            }
        };

        utility.storage.getFile(options);
    }
};
