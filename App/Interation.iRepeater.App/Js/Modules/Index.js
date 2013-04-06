var index =
{
    init: function ()
    {
        var _this = this;

        this._config = this._getConfig();

        this._initPage(this._config);
        this._resizePage($(window).width(), $(window).height());

        $("div#header input.keywords").watermark("search")
                                      .focus(function (event) { _this._focus(this, event); })
                                      .keypress(function (event) { _this._keypress(this, event); })
                                      .bind("propertychange input", function (event) { _this._change(this, event); })
                                      .change();
        $("div#header a.clear").click(function (event) { _this._clearKeywords(this, event); });
        $("div#footer ul.menu a:first").click();
    },
    search: function (keywords)
    {
        alert(keywords);
    },
    _clearKeywords: function (sender, event)
    {
        $("input[name=keywords]").val("").focus().parent().removeClass("filled");
    },
    _focus: function (sender, event)
    {
        $(sender).select();
    },
    _keypress: function (sender, event)
    {
        sender = $(sender);
        var name = sender.attr("name");

        switch (name)
        {
            case "keywords":
                if (event.keyCode == 13 && !sender.hasClass("empty")) { this.search(sender.val()); }
                break;
        }
    },
    _change: function (sender, event)
    {
        sender = $(sender);
        var name = sender.attr("name");

        switch (name)
        {
            case "keywords":
                if (sender.val().length == 0) { sender.parent(".filled").removeClass("filled"); }
                else if (!sender.hasClass("empty")) { sender.parent().addClass("filled"); }
                break;
        }
    },
    _selectMenu: function (sender, name, config)
    {
        sender = $(sender);
        sender.parents("ul.menu").find("a").removeClass("selected");
        sender.addClass("selected");

        var header = $("div#header");
        var h1 = header.children("h1");
        var search = header.children("div.search");

        h1.text(config.headerText);
        search.css({ display: config.showSearh ? "block" : "none" });

        this._loading(name);
    },
    _loading: function (action)
    {
        var main = $("div#main");
        var loading = main.children("div.loading").show();
        var url = config.urls.api.replace(/(\/*)$/, "/") + action;

        var ajaxJson =
        {
            url: url,
            success: function (json)
            {
                alert(JSON.stringify(json));
            },
            error: function (response)
            {
                alert("Cannot connect to iRepeater Store");
            },
            complete: function ()
            {
                loading.hide();
            }
        };

        $.ajax(ajaxJson);
    },
    _getShadow: function (offset, range, color, inset)
    {
        return offset + "px " + offset + "px " + range + "px " + color + (inset ? " inset" : "");
    },
    _getConfig: function ()
    {
        var field = function (headerText, menuText, showSearh)
        {
            this.headerText = headerText;
            this.menuText = menuText;
            this.showSearh = showSearh;
        };

        var config =
        {
            featured: new field("iRepeater Store", "featured", true),
            genius: new field("Genius", "genius", true),
            charts: new field("Top Charts", "top charts", true),
            categories: new field("Categories", "categories", true),
            purchased: new field("Purchased", "purchased", false),
            updates: new field("Updates", "updates", false),
            search: new field("Search", undefined, true)
        };

        return config;
    },
    _initPage: function (config)
    {
        var _this = this;
        var footer = $("div#footer");
        var ul = footer.children("ul.menu").clone();
        var li = ul.children("li").first().clone();

        footer.empty();
        ul.empty().appendTo(footer);

        $.each(config, function (key, field)
        {
            if (field.menuText != undefined)
            {
                var item = li.clone();
                var anchor = item.find("a");

                anchor.addClass(key).text(field.menuText);
                anchor.click(function () { _this._selectMenu(this, key, field); });

                item.appendTo(ul);
            }
        });
    },
    _resizePage: function (width, height)
    {
        var header = $("div#header");
        var main = $("div#main");
        var footer = $("div#footer");

        header.css({ height: parseInt($(window).height() * 0.055) }).css({ fontSize: parseInt(header.height() * 0.5), lineHeight: header.css("height") });
        footer.css({ height: parseInt($(window).height() * 0.066) });
        main.css({ height: height - header.height() - footer.height() });

        this._resizeHeader(header, header.width(), header.height());
        this._resizeMain(main, main.width(), main.height());
        this._resizeFooter(footer, footer.width(), footer.height());

        header.show();
        main.show();
        footer.show();
    },
    _resizeHeader: function (header, width, height)
    {
        var h1 = header.children("h1");
        var search = header.children("div.search");
        var keywords = search.children("input.keywords");
        var searchClear = search.children("a.clear");

        h1.css({ fontSize: parseInt(height * 0.5), height: height, lineHeight: height + "px", width: parseInt(width * 0.5) });
        search.css({ height: parseInt(height * 0.7), right: parseInt(width * 0.013), width: parseInt(width * 0.15) });
        search.css({ borderRadius: search.height(), marginTop: parseInt(0.5 * (height - search.height())), boxShadow: this._getShadow(height * 0.05, height * 0.1, "rgba(0,0,0,0.5)", true) });
        keywords.css({ fontSize: parseInt(search.height() * 0.5), marginLeft: search.height(), marginTop: parseInt(search.height() * 0.15) }).css({ height: search.height() - 2 * parseInt(keywords.css("margin-top")) });
        keywords.css({ lineHeight: keywords.css("height"), width: search.width() - 2 * parseInt(keywords.css("margin-left")) });
        searchClear.css({ height: keywords.height(), marginTop: keywords.css("margin-top") }).css({ marginLeft: searchClear.css("margin-top"), width: searchClear.height() });
    },
    _resizeMain: function (main, width, height)
    {
        var loading = main.children("div.loading");
        var wrapper = main.children("div.wrapper");

        loading.css({ height: parseInt(height * 0.03) }).css({ width: parseInt(loading.height() * 4.38) });
        loading.css({ fontSize: loading.height() * 0.7, lineHeight: loading.css("height"), marginTop: parseInt(0.5 * (height - loading.height())), marginLeft: parseInt(0.5 * (width - loading.width())) });
    },
    _resizeFooter: function (footer, width, height)
    {
        var menu = footer.find("ul.menu");
        var menuItems = menu.children("li");
        var anchors = menuItems.children("a");

        menuItems.css({ height: height, width: parseInt(width * 0.08) });
        menu.css({ width: menuItems.length * menuItems.width() });
        anchors.css({ margin: parseInt(menuItems.height() * 0.075) + "px " + parseInt(menuItems.width() * 0.15) + "px", paddingTop: parseInt(menuItems.height() * 0.5) });
        anchors.css({ height: menuItems.height() - 2 * parseInt(anchors.css("margin-top")) - parseInt(anchors.css("padding-top")), width: menuItems.width() - 2 * parseInt(anchors.css("margin-left")) });
        anchors.css({ borderRadius: height * 0.05, fontSize: parseInt(anchors.height() * 0.65), lineHeight: anchors.css("height") });
    }
};
