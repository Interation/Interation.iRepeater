var index =
{
    init: function ()
    {
        var _this = this;

        $(window).resize(function () { _this._resizePage(); }).resize();
        $("div.search a.clear").click(function () { _this._clearKeywords(); });
        $("div.header div.center a.button").click(function () { _this._selectHeader(this); }).eq(0).click();
        $("div.product").click(function (event) { });
        $("input:text").watermark(language.getValue("search"))
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
        var headerLinks = headerNav.children("a.button");
        var search = header.children("div.search");
        var keywords = search.children("input");
        var keywordsCloser = search.children("a.clear");
        var main = $("body>div.main");
        var banner = main.children("div.banner");
        var bannerDisplayer = banner.children("div.displayer");
        var bannerSections = banner.find("ul.section>li");
        var footer = $("body>div.footer");

        header.css({ height: parseInt($(window).height() * 0.055) });
        headerLinks.css({ height: parseInt(header.height() * 0.7), width: parseInt($(window).width() * 0.08) });
        headerLinks.css({ fontSize: parseInt(0.1 * (headerLinks.height() + headerLinks.width())), lineHeight: headerLinks.height() + "px" });
        headerNav.css({ float: "none", height: headerLinks.height(), width: headerLinks.length * headerLinks.width() });
        headerNav.css({ marginTop: parseInt((header.height() - headerNav.height()) * 0.5) });
        headerNav.css({ marginBottom: header.height() - headerNav.height() - parseInt(headerNav.css("margin-top")) });
        search.css({ float: "right", height: headerNav.height(), right: parseInt($(window).width() * 0.013), position: "absolute", width: parseInt($(window).width() * 0.15) });
        search.css({ borderRadius: parseInt(search.height() * 0.5), marginTop: parseInt(0.5 * (header.height() - search.height())) });
        keywords.css({ float: "left", fontSize: headerLinks.css("font-size"), height: parseInt(search.height() * 0.75) });
        keywords.css({ lineHeight: keywords.height() + "px", marginLeft: search.height(), marginTop: parseInt(0.75 * (search.height() - keywords.height())) });
        keywords.css({ width: search.width() - 2 * parseInt(keywords.css("margin-left")) });
        keywordsCloser.css({ height: parseInt(search.height() * 0.7) }).css({ width: keywordsCloser.height() });
        keywordsCloser.css({ marginTop: parseInt(0.5 * (search.height() - keywordsCloser.height())) }).css({ marginLeft: keywordsCloser.css("margin-top") });
        bannerSections.css({ width: parseInt($(window).width() * 0.2435) }).css({ height: parseInt(bannerSections.width() * 0.35) });
        banner.css({ height: 3 * bannerSections.height(), width: 4 * bannerSections.width() }).css({ margin: parseInt(0.5 * ($(window).width() - banner.width())) });
        footer.css({ height: parseInt($(window).height() * 0.06) });
        main.css({ height: $(window).height() - header.height() - footer.height() });

        this._resizeClassify({ margin: parseInt(banner.css("margin-top")) });
    },
    _resizeClassify: function (options)
    {
        var classify = $("div.classify");
        var head = classify.children("p.head");
        var nav = classify.children("ul.navs");
        var navs = nav.children("li");
        var pages = classify.find("ul.pages>li");
        var products = pages.children("div.product");
        var icon = products.children("div.icon");
        var info = products.children("div.info");
        var title = info.children("p.title");
        var text = info.children("p.text");
        var star = info.children("p.star");
        var action = products.children("div.action");

        var width = parseInt($(window).width() / 3 - 2);
        var autoWidth = $(window).width() - 2 * width - 6;

        head.css({ height: parseInt($(window).width() * 0.033), paddingLeft: options.margin }).css({ lineHeight: head.height() + "px" });
        nav.css({ height: parseInt($(window).width() * 0.02) }).css({ marginBottom: parseInt(0.5 * nav.height()), marginTop: parseInt(0.5 * nav.height()), width: navs.length * nav.height() });
        navs.css({ height: parseInt(nav.height() * 0.3) }).css({ borderRadius:navs.height(), margin: parseInt(0.5 * (nav.height() - navs.height())), width: navs.height() });
        pages.css({ width: $(window).width() });
        products.css({ height: parseInt($(window).width() * 0.1) });
        icon.css({ height: products.height() - 2 * options.margin, margin: options.margin }).css({ width: icon.height() });
        info.css({ height: icon.height(), margin: parseInt(icon.css("margin-left")), marginLeft: 0, width: width - icon.width() - 3 * parseInt(icon.css("margin-left")) });
        title.css({ height: parseInt(info.height() * 0.18) }).css({ fontSize: title.height(), lineHeight: title.height() + "px" });
        text.css({ height: parseInt(info.height() * 0.14) }).css({ fontSize: text.height(), lineHeight: text.height() + "px" });
        text.css({ marginBottom: parseInt((info.height() - title.height() - 3 * text.height()) / 4) });
        title.css({ marginBottom: parseInt(info.height() - 3 * (text.height() + parseInt(text.css("margin-bottom"))) - title.height()) });
        star.css({ paddingLeft: text.height() * 6 });
        action.css({ height: parseInt(products.height() * 0.2), marginRight: options.margin, width: parseInt(width * 0.15) }).css({ fontSize: text.css("font-size") });
        action.css({ lineHeight: action.height() + "px", marginTop: -parseInt(0.5 * (products.height() + action.height())) });
        head.css({ fontSize: title.css("font-size") });

        $.each(pages.children("div.product"), function (i, product)
        {
            if (parseInt((i / 3) % 2) === 1) { $(product).addClass("alter"); }
            $(product).css({ width: i % 3 === 2 ? autoWidth : width });
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
