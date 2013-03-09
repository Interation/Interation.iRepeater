var index =
{
    init: function ()
    {
        var _this = this;

        $(window).resize(function () { _this._resizePage(); }).resize();
        $("div.search a.clear").click(function () { _this._clearKeywords(); });
        $("div.header div.center a.button").click(function () { _this._selectHeader(this); }).eq(0).click();
        $("input:text").watermark("搜索")
                       .focus(function (event) { _this._focus(this, event); })
                       .keypress(function (event) { _this._keypress(this, event); })
                       .bind("change propertychange input", function (event) { _this._change(this, event); })
                       .change();
    },
    search: function (keywords)
    {
        alert(keywords);
    },
    _resizePage: function ()
    {
        var header = $("body>div.header");
        var headerNav = header.children("div.center");
        var headerNavs = headerNav.children("a.button");
        var search = header.children("div.search");
        var keywords = search.children("input");
        var keywordsCloser = search.children("a.clear");
        var main = $("body>div.main");
        var banner = main.children("div.banner");
        var bannerDisplayer = banner.children("div.displayer");
        var bannerSections = banner.find("ul.section>li");
        var footer = $("body>div.footer");

        header.css({ height: $(window).height() * 0.05 });
        headerNavs.css({ height: header.height() * 0.7, width: header.height() * 2.5 });
        headerNav.css({ float: "none", height: headerNavs.height(), width: headerNavs.length * headerNavs.width() });
        headerNav.css({ marginTop: (header.height() - headerNav.height()) * 0.5 });
        headerNav.css({ marginBottom: header.height() - headerNav.height() - parseInt(headerNav.css("margin-top")) });
        search.css({ float: "right", height: header.height() * 0.8, right: $(window).width() * 0.02, position: "absolute" });
        search.css({ borderRadius: search.height() * 0.5, marginTop: 0.5 * (header.height() - search.height()), width: search.height() * 7 });
        keywords.css({ float: "left", height: search.height() * 0.75 });
        keywords.css({ lineHeight: keywords.height() + "px", marginLeft: search.height(), marginTop: 0.75 * (search.height() - keywords.height()) });
        keywords.css({ width: search.width() - 2 * parseInt(keywords.css("margin-left")) });
        keywordsCloser.css({ height: search.height() * 0.7 }).css({ width: keywordsCloser.height() });
        keywordsCloser.css({ marginTop: 0.5 * (search.height() - keywordsCloser.height()) }).css({ marginLeft: keywordsCloser.css("margin-top") });
        bannerSections.css({ width: $(window).width() * 0.32 }).css({ height: bannerSections.width() * 0.25 });
        banner.css({ height: 3 * bannerSections.height(), width: 3 * bannerSections.width() }).css({ margin: 0.5 * ($(window).width() - banner.width()) });
        footer.css({ height: $(window).height() * 0.056 });
        main.css({ height: $(window).height() - header.height() - footer.height() });

        this._resizeClassify({ margin: parseInt(banner.css("margin-top")) });
    },
    _resizeClassify: function (options)
    {
        var classify = $("div.classify");
        var head = classify.children("h2");
        var nav = classify.children("ul.nav");

        var width = parseInt($(window).width() / 3 - 2);
        var autoWidth = $(window).width() - 2 * width - 6;

        head.css({ height: $(window).height() * 0.06, paddingLeft: options.margin }).css({ lineHeight: head.height() + "px" });
        nav.css({ float: "none", width: nav.css({ float: "left" }).outerWidth() });

        $.each(classify.find("ul.pages>li"), function (i, page)
        {
            page = $(page).css({ width: $(window).width() });

            $.each(page.children("div.item"), function (ii, link)
            {
                if (parseInt((ii / 3) % 2) === 1) { $(link).addClass("alter"); }
                link = $(link).css({ height: $(window).width() * 0.1, width: ii % 3 === 2 ? autoWidth : width });
            });
        });
    },
    _selectHeader: function (sender)
    {
        sender = $(sender);
        sender.parent().children().removeClass("shadow");
        sender.addClass("shadow");
    },
    _focus: function (sender, event)
    {
        $(sender).select();
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
    _clearKeywords: function ()
    {
        $("input[name=keywords]").val("").focus().parent().removeClass("filled");
    }
};
