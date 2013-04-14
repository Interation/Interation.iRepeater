var index =
{
    init: function ()
    {
        var _this = this;

        this._config = this._getConfig();
        this._initPage(this._config);
        this._resizePage($(window).width(), $(window).height());

        $("body").bind("mouseup", function (event) { _this._touchEnd(this, event); })
                 .bind("mousemove", function (event) { _this._touchMove(this, event); })
                 .bind("touchend", function (event) { _this._touchEnd(this, event.originalEvent.touches[0]); })
                 .bind("touchmove", function (event) { _this._touchMove(this, event.originalEvent.touches[0]); event.preventDefault(); });
        $("div#header input.keywords").watermark("Search")
                                      .focus(function (event) { $(this).select(); })
                                      .keypress(function (event) { _this._keypress(this, event); })
                                      .bind("propertychange input", function (event) { _this._change(this, event); });
        $("div#header div.search a.clear").click(function () { _this._clearKeywords(); });
        $("div#footer ul.menu a:first").click();

        $("div.wrapper").scrollTop(100);
    },
    _search: function (keywords)
    {
        alert(keywords);
    },
    _clearKeywords: function (sender, event)
    {
        $("input[name=keywords]").val("").parent().removeClass("filled");
    },
    _selectMenu: function (sender, name, config)
    {
        sender = $(sender);
        sender.parents("ul.menu").find("a").removeClass("selected");
        sender.addClass("selected");

        var header = $("div#header");
        var h1 = header.children("h1");
        var search = header.children("div.search");

        h1.filter(":visible").remove();
        h1.filter(".template").clone().removeClass("template").text(config.headerText).appendTo(header);
        search.css({ display: config.showSearh ? "block" : "none" });

        this._loading(name);
    },
    _loading: function (page)
    {
        var _this = this;
        var main = $("div#main");
        var loading = main.children("div.loading").show();
        var url = config.urls.api.replace(/(\/*)$/, "/") + page;
        var loadingIndex = this.__loadingIndex = (this.__loadingIndex == undefined ? 0 : this.__loadingIndex + 1);

        var ajaxJson =
        {
            url: url,
            cache: false,
            success: function (json) { if (_this.__loadingIndex == loadingIndex) { _this._generateBlock(page, json); } },
            error: function (response) { alert("Cannot connect to iRepeater Store"); },
            complete: function () { loading.hide(); }
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
                if (event.keyCode == 13 && !sender.hasClass("empty")) { this._search(sender.val()); }
                break;
        }
    },
    _touchStart: function (sender, event)
    {
        if (this._touchInfo == undefined)
        {
            var touch = event;

            this._touchInfo =
            {
                start: { pageX: touch.pageX, pageY: touch.pageY, time: Date.now() }
            };
        }

        switch (sender.attr("for"))
        {
            case "showcase":
                this._touchInfo.showcase =
                {
                    sender: sender,
                    marginLeft: parseInt(sender.css("margin-left")),
                    minMarginLeft: -100
                };
                break;
            case "wrapper":
                this._touchInfo.wrapper =
                {
                    sender: sender,
                    marginTop: parseInt(sender.css("margin-top")),
                    minMarginTop: sender.parent().height() - sender.height()
                };
                break;
        }
    },
    _touchMove: function (sender, event)
    {
        if (this._touchInfo == undefined)
        {
            return;
        }

        var start = this._touchInfo.start;
        var current = event;

        if (this._touchInfo.vertical == undefined)
        {
            var xx = Math.pow(start.pageX - current.pageX, 2);
            var yy = Math.pow(start.pageY - current.pageY, 2);

            if (xx + yy > 450)
            {
                this._touchInfo.vertical = yy > xx;
            }
        }

        if (this._touchInfo.showcase != undefined)
        {
            if (this._touchInfo.vertical === false)
            {
                var _info = this._touchInfo.showcase;
                var _sender = _info.sender;

                var marginLeft = _info.marginLeft + current.pageX - start.pageX;
                if (marginLeft < _info.minMarginLeft) { marginLeft = _info.minMarginLeft; }
                else if (marginLeft > 0) { marginLeft = 0; }

                _sender.css({ marginLeft: marginLeft });
            }
        }

        if (this._touchInfo.wrapper != undefined)
        {
            if (this._touchInfo.vertical === true || this._touchInfo.showcase == undefined)
            {
                var _info = this._touchInfo.wrapper;
                var _sender = _info.sender;

                var marginTop = _info.marginTop + current.pageY - start.pageY;
                if (marginTop < _info.minMarginTop) { marginTop = _info.minMarginTop + (marginTop - _info.minMarginTop) * 0.5; }
                else if (marginTop > 0) { marginTop = marginTop * 0.5; }

                if (_info.footprint == undefined)
                {
                    _info.footprint = [{ time: start.time, value: _info.marginTop }, { time: Date.now(), value: marginTop }];
                }
                else
                {
                    _info.footprint = [_info.footprint[1], { time: Date.now(), value: marginTop }];
                }

                _sender.css({ marginTop: marginTop });
            }
        }
    },
    _touchEnd: function (sender, event)
    {
        if (this._touchInfo == undefined)
        {
            return;
        }

        if (this._touchInfo.wrapper != undefined)
        {
            var _info = this._touchInfo.wrapper;
            var _sender = _info.sender;
            var _footprint = _info.footprint;

            if (_footprint != undefined)
            {
                var delta = _footprint[1].time - _footprint[0].time;
                var velocity = delta == 0 ? 0 : (_footprint[1].value - _footprint[0].value) / delta;
                _sender.damping("margin-top", { range: [_info.minMarginTop, 0], flexible: true, factor: 0.01, v0: velocity });
            }
        }

        this._touchInfo = null;
    },
    _touchcancel: function (sender, event)
    {
        
    },
    _bindEvents: function (sender)
    {
        var _this = this;

        switch (sender.attr("for"))
        {
            case "frame":
                sender.children("div.wrapper").bind("touchstart", function (event)
                {
                    _this._touchStart($(this), event.originalEvent.touches[0]);
                }).bind("mousedown", function (event)
                {
                    _this._touchStart($(this), event);
                });
                break;
            case "showcase":
                sender.children("ul.pages").bind("touchstart", function (event)
                {
                    _this._touchStart($(this), event.originalEvent.touches[0]);
                }).bind("mousedown", function (event)
                {
                    _this._touchStart($(this), event);
                });
                break;
        }
    },
    _initPage: function (config)
    {
        var _this = this;
        var footer = $("div#footer");
        var ul = footer.children("ul.menu").clone();
        var li = ul.children("li").first().clone();

        ul.empty().appendTo(footer.empty());

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
    _generateBlock: function (page, json)
    {
        var ul = $("div#main>ul.frames");
        var clone = ul.children(".template").clone().removeClass("template").appendTo(ul);
        var wrapper = clone.children("div.wrapper").empty();

        switch (page)
        {
            case "featured":
                this._generateBanner(wrapper, json.Topics);
                this._generateShowcase(wrapper, json.Newest, 6);
                this._generateShowcase(wrapper, json.Hottest, 6);

                break;
        }

        this._bindEvents(clone);
    },
    _generateBanner: function (parent, info)
    {
        var template = $("div#main>ul.frames>li.template");
        var banner = template.find("div.banner").clone().hide().appendTo(parent);
        var displayer = banner.children("div.displayer");
        var section = banner.children("ul.section");
        var li = section.children("li:first");

        section.empty();

        $.each(info, function (i, json)
        {
            var item = li.clone().appendTo(section);
            item.find("img").attr({ src: json.ImageUrl });
        });

        var frame = function ()
        {
            li = section.children();
            displayer.find("img").attr("src", li.last().find("img").attr("src"));
            section.css({ marginTop: defaultMargin });
            li.first().before(li.last().remove());

            setTimeout(function ()
            {
                section.animate({ marginTop: animationMargin }, 1000, frame);
            }, 3000);
        }

        var frameHeight = li.height();
        var framesCount = section.children().length;
        var defaultMargin = (3 - framesCount) * frameHeight;
        var animationMargin = (4 - framesCount) * frameHeight;

        frame();

        return banner.show();
    },
    _generateShowcase: function (parent, info, pageSize)
    {
        var template = $("div#main>ul.frames>li.template");
        var showcase = template.find("div.showcase").clone().hide().appendTo(parent);
        var pages = showcase.children("ul.pages");
        var pageTemplage = pages.children("li:first").clone().empty();
        var navs = showcase.children("ul.navs");
        var navTemplate = navs.children("li:first").clone().empty();
        var productTemplage = pages.children().children("div.product:first").clone();

        var pageCount = Math.ceil(info.Products.length / pageSize);
        var autoWidth = $(window).width() - 2 * productTemplage.width() - 6;

        pages.empty();
        navs.empty().css({ width: (navTemplate.width() + 2 * parseInt(navTemplate.css("margin-left"))) * pageCount });
        navs.css({ margin: parseInt(productTemplage.height() * 0.1) + "px " + parseInt(0.5 * (showcase.width() - navs.width())) + "px" });
        showcase.find("p.head>span.name").text(info.Title);

        for (var i = 0; i < pageCount; i++)
        {
            var pageItem = pageTemplage.clone().appendTo(pages);
            var navItem = navTemplate.clone().appendTo(navs);

            for (var j = 0; j < pageSize; j++)
            {
                var index = i * pageSize + j;
                var product = info.Products[index];
                var productElement = productTemplage.clone();

                if (index >= info.length) { break; }

                productElement.find("div.icon>img").attr({ src: product.IconUrl });
                productElement.find("p.title").text(product.Name);
                productElement.find("p.time>span").text($.formatDate($.resolveDate(product.CreatedDate), "MMMM dd, yyyy"));
                productElement.find("p.category>span.class").text(product.Class);
                productElement.find("p.category>span.subClass").text(product.SubClass);
                productElement.find("p.star").addClass("star").css({ backgroundPositionY: function () { return -$(this).height() * product.Star } });
                productElement.find("a.price").text(product.Price == 0 ? "Free" : product.Price);

                if (parseInt(j / 3 % 2) == 1) { productElement.addClass("alter"); }
                if (j % 3 == 1) { productElement.css({ width: autoWidth }); }
                productElement.appendTo(pageItem);
            }
        }

        this._bindEvents(showcase);

        return showcase.show();
    },
    _resizePage: function (width, height)
    {
        var header = $("div#header");
        var main = $("div#main");
        var footer = $("div#footer");

        header.css({ height: parseInt(width * 0.045) });
        footer.css({ height: parseInt(width * 0.050) });
        main.css({ height: Math.round(height - header.height() - footer.height()) });

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

        h1.css({ fontSize: parseInt(height * 0.42), height: height, lineHeight: height + "px", width: parseInt(width * 0.5) });
        search.css({ height: parseInt(height * 0.33) * 2, right: parseInt(width * 0.013), width: parseInt(width * 0.2) });
        search.css({ borderRadius: search.height(), marginTop: Math.round(0.5 * (height - search.height())), boxShadow: this._getShadow(height * 0.05, height * 0.05, "rgba(0,0,0,0.5)", true) });
        keywords.css({ fontSize: parseInt(search.height() * 0.5), marginLeft: search.height(), marginTop: parseInt(search.height() * 0.15) }).css({ height: search.height() - 2 * parseInt(keywords.css("margin-top")) });
        keywords.css({ lineHeight: keywords.css("height"), width: search.width() - 2 * parseInt(keywords.css("margin-left")) });
        searchClear.css({ height: keywords.height(), marginTop: keywords.css("margin-top") }).css({ marginLeft: searchClear.css("margin-top"), width: searchClear.height() });
    },
    _resizeMain: function (main, width, height)
    {
        var loading = main.children("div.loading");
        var frames = main.children("ul.frames").children();
        var wrapper = frames.children("div.wrapper");
        var banner = wrapper.children("div.banner");
        var showcase = wrapper.children("div.showcase");

        loading.css({ height: parseInt(height * 0.03) }).css({ width: parseInt(loading.height() * 4.38) });
        loading.css({ fontSize: loading.height() * 0.7, lineHeight: loading.css("height"), marginTop: parseInt(0.5 * (height - loading.height())), marginLeft: parseInt(0.5 * (width - loading.width())) });
        banner.css({ width: 4 * parseInt(width * 0.243) }).css({ height: 3 * parseInt(banner.width() * 0.1), margin: 0.5 * parseInt(width - banner.width()) });

        this._resizeBanner(banner, banner.width(), banner.height());
        this._resizeShowcase(showcase, width);
    },
    _resizeBanner: function (banner, width, height)
    {
        var displayer = banner.children("div.displayer");
        var section = banner.children("ul.section");
        var li = section.children("li");

        displayer.css({ height: height, width: 3 * width / 4 });
        section.css({ width: width / 4 });
        li.css({ height: height / 3, width: "100%" });
    },
    _resizeShowcase: function (showcase, width, height)
    {
        var head = showcase.children("p.head");
        var headName = head.children("span.name");
        var headAnchor = head.children("a");
        var navs = showcase.children("ul.navs");
        var navList = navs.children("li");
        var pages = showcase.children("ul.pages");
        var pageList = pages.children("li");
        var product = pageList.children("div.product");
        var icon = product.children("div.icon");
        var info = product.children("div.info");
        var title = info.children("p.title");
        var text = info.children("p.text");
        var star = info.children("p.star");
        var action = product.children("div.action");
        var actionAnchor = action.children("a");

        var unitWidth = parseInt(width / 3 - 2);
        var autoWidth = width - 2 * unitWidth - 6;
        var titleMargin = parseInt(showcase.parent().children("div.banner").css("margin-left"));

        head.css({ boxShadow: this._getShadow(width * 0.002, width * 0.003, "rgba(0,0,0,0.5)"), height: parseInt(width * 0.033), paddingLeft: titleMargin }).css({ lineHeight: head.css("height") });
        headName.css({ fontSize: parseInt(0.015 * width) });
        headAnchor.css({ fontSize: 0.35 * head.height(), marginLeft: head.height() * 0.5 });
        navs.css({ height: parseInt(width * 0.02) }).css({ marginBottom: parseInt(0.5 * navs.height()), marginTop: parseInt(0.5 * navs.height()), width: navList.length * navs.height() });
        navList.css({ height: parseInt(navs.height() * 0.3) }).css({ borderRadius: navList.height(), margin: parseInt(0.5 * (navs.height() - navList.height())), width: navList.height() });
        pageList.css({ width: width });
        product.css({ height: parseInt(width * 0.1), width: unitWidth });
        icon.css({ borderRadius: parseInt(width * 0.008), height: product.height() - 2 * titleMargin, margin: titleMargin }).css({ width: icon.height() });
        info.css({ height: icon.height(), margin: parseInt(icon.css("margin-left")), marginLeft: 0, width: unitWidth - icon.width() - 3 * parseInt(icon.css("margin-left")) });
        title.css({ height: parseInt(0.015 * width) }).css({ fontSize: title.height(), lineHeight: title.css("height") });
        text.css({ height: parseInt(0.012 * width) }).css({ fontSize: text.height(), lineHeight: text.css("height") });
        text.css({ marginBottom: parseInt((info.height() - title.height() - 3 * text.height()) / 4) });
        title.css({ marginBottom: parseInt(info.height() - 3 * (text.height() + parseInt(text.css("margin-bottom"))) - title.height()) });
        star.css({ paddingLeft: text.height() * 6 });
        action.css({ height: parseInt(product.height() * 0.25), marginRight: titleMargin }).css({ fontSize: text.css("font-size") }).css({ marginTop: -parseInt(0.5 * (product.height() + action.height())) });
        actionAnchor.css({ lineHeight: action.css("height"), padding: "0px " + parseInt(action.height() * 0.6) + "px" });
    },
    _resizeFooter: function (footer, width, height)
    {
        var menu = footer.find("ul.menu");
        var menuItems = menu.children("li");
        var anchors = menuItems.children("a");

        var unitWidth = parseInt(width * 0.075);
        var margin = { h: parseInt(unitWidth * 0.25), v: parseInt(height * 0.075) };

        menu.css({ height: height, width: menuItems.length * (unitWidth + 2 * margin.h) });
        menuItems.css({ height: height - 2 * margin.v, margin: margin.v + "px " + margin.h + "px", width: unitWidth });
        anchors.css({ height: parseInt(menuItems.height() * 0.35) }).css({ lineHeight: anchors.css("height"), paddingTop: menuItems.height() - anchors.height() });
        anchors.css({ borderRadius: height * 0.08, fontSize: parseInt(anchors.height() * 0.75) });
    }
};
