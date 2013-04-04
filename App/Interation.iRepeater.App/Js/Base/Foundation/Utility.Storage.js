utility.storage =
{
    getFile: function (options)
    {
        var url = new Windows.Foundation.Uri("ms-appx:///" + options.url);

        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(function (file)
        {
            Windows.Storage.FileIO.readTextAsync(file).then(function (response)
            {
                if (typeof options.success == "function")
                {
                    options.success(response);
                }

                if (typeof options.complete == "function")
                {
                    options.complete();
                }
            }, function (response)
            {

            });
        }, function (response)
        {
            if (typeof options.error == "function")
            {
                options.error(response);
            }

            if (typeof options.complete == "function")
            {
                options.complete();
            }
        });
    },
    saveFile: function (options)
    {
        var url = new Windows.Foundation.Uri("ms-appx:///" + options.url);

        Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(function (file)
        {
            Windows.Storage.FileIO.writeTextAsync(file, options.content).then(function (response)
            {

            }, function (response)
            {

            });
        }, function (respoise)
        {

        });
    }
};
