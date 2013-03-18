(function ($)
{
    $.extend(
    {
        getFile:function(options)
        {
            options = options || {};
            options.url = options.url || "";
            var url = new Windows.Foundation.Uri("ms-appx:///" + options.url);
            Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(function (file)
            {
                Windows.Storage.FileIO.readTextAsync(file).then(function (text)
                {
                    if (typeof options.success == "function")
                    {
                        options.success(text);
                    }
                });
            }, function (response)
            {
                if (typeof options.error == "function")
                {
                    options.error(response);
                }
            });
        },
        fileSystem:
        {
            getFile: function (path, options)
            {
                var fail = function (error)
                {
                    if (typeof options.fail == "function") { options.fail(error); }
                };

                var success = function (entry)
                {
                    if (typeof options.success == "function") { options.success(entry); }
                }

                var getFileSystem = function (fileSystem)
                {
                    fileSystem.root.getFile(path, { exclusive: false }, function (entry)
                    {
                        success(entry);
                    }, function (error)
                    {
                        if (!options.create)
                        {
                            fail(error);
                            return;
                        }

                        _this._createFile(fileSystem, path, success, function (error)
                        {
                            var directory = path.substring(0, path.lastIndexOf("/"));

                            _this._createDirectory(fileSystem, directory, function (entry)
                            {
                                _this._createFile(fileSystem, path, success, fail);
                            }, fail);
                        });
                    });
                }

                var _this = this;
                options = options || {};
                options.create = options.create === true;
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getFileSystem, function (error) { fail(error); });
            },
            _createFile: function (fileSystem, path, success, fail)
            {
                fileSystem.root.getFile(path, { create: true, exclusive: false }, success, fail);
            },
            getDirectory: function (path, options)
            {
                var fail = function (error)
                {
                    if (typeof options.fail == "function") { options.fail(error); }
                };

                var success = function (entry)
                {
                    if (typeof options.success == "function") { options.success(entry); }
                }

                var getFileSystem = function (fileSystem)
                {
                    fileSystem.root.getDirectory(path, { exclusive: false }, function (entry)
                    {
                        success(entry);
                    }, function (error)
                    {
                        if (!options.create)
                        {
                            fail(error);
                            return;
                        }

                        _this._createDirectory(fileSystem, path, success, fail);
                    });
                };

                var _this = this;
                options = options || {};
                options.create = options.create === true;
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, getFileSystem, function (error) { fail(error); });
            },
            _createDirectory: function (fileSystem, path, success, fail)
            {
                var root = fileSystem.root;
                var dirs = path.split("/").reverse();

                var createDir = function (dir)
                {
                    root.getDirectory(dir, { create: true, exclusive: false }, function (entry)
                    {
                        root = entry;
                        if (dirs.length > 0) { createDir(dirs.pop()); }
                        else { success(entry); }
                    }, fail);
                };

                createDir(dirs.pop());
            }
        }
    });
})(jQuery);
