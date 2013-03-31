(function ($)
{
    var draggazilla = function (sender, options)
    {
        this.sender = $(sender);

        options = options || {};
        options.drag = options.drag || {};
        options.drag.can = options.drag.can != false;
        options.scrollbar = options.scrollbar || {};
        options.scrollbar.visible = options.scrollbar.visible != false;
        options.scrollbar.line = options.scrollbar.line || {};
        options.scrollbar.line.width = isNaN(options.scrollbar.line.width) ? 0 : parseInt(options.scrollbar.line.width);
        options.scrollbar.line.margin = isNaN(options.scrollbar.line.margin) ? 5 : parseInt(options.scrollbar.line.margin);
        options.scrollbar.line.color = options.scrollbar.line.color || "#ff0000";
        options.scrollbar.holder = options.scrollbar.holder || {};
        options.scrollbar.holder.width = isNaN(options.scrollbar.holder.width) ? options.scrollbar.line.width : parseInt(options.scrollbar.holder);
        options.scrollbar.holder.width = (options.scrollbar.line.width + options.scrollbar.holder.width) % 2 == 0 ? options.scrollbar.holder.width : parseInt(options.scrollbar.holder.width * 0.5) * 2 + 1;
        options.scrollbar.holder.length = isNaN(options.scrollbar.holder.length) ? 0 : parseInt(options.scrollbar.holder.length);
        options.scrollbar.holder.padding = isNaN(options.scrollbar.holder.padding) ? 3 : parseInt(options.scrollbar.holder.padding);
        options.scrollbar.holder.margin = isNaN(options.scrollbar.holder.margin) ? 0 : parseInt(options.scrollbar.holder.margin);
        options.scrollbar.holder.borderRadius = isNaN(options.scrollbar.holder.borderRadius) ? 0 : options.scrollbar.holder.borderRadius;
        options.scrollbar.holder.color = options.scrollbar.holder.color || "#000000";
        options.scrollbar.opacity = isNaN(options.scrollbar.opacity) ? 0.5 : options.scrollbar.opacity;
 
        this.options = options;
    };

    draggazilla.prototype =
    {
        init: function ()
        {
            var _this = this;

            this._parent = this.sender.parent();
            this._containerWidth = this._parent.width();
            this._containerHeight = this._parent.height();
            this._width = this.sender.width();
            this._height = this.sender.height();
            this._generateContainer(this._parent);

            this.sender.appendTo(this._container);

            if (this.options.scrollbar.visible)
            {
                this._generateScrollbar();
            }
            
            if (this.options.drag.can)
            {
                this.sender.mousedown(function (event) { _this._mousedown(this, event); });
            }

            $(this._scrollX).mousedown(function (event) { _this._mousedown(this, event); return false; });
            $(this._scrollY).mousedown(function (event) { _this._mousedown(this, event); return false; });
            $(window).mousemove(function (event) { _this._mousemove(this, event); }).mouseup(function (event) { _this._mouseup(this, event); });

            this.recaculate();

            return this;
        },
        recaculate: function ()
        {
            this._width = this.sender.width();
            this._height = this.sender.height();
            this._containerWidth = this._parent.width();
            this._containerHeight = this._parent.height();

            if (this.options.scrollbar.visible)
            {
                if (this._width <= this._containerWidth) { this._scrollX.parent().hide(); }
                else { this._scrollX.css({ width: this._getScrollbarLength(this._containerWidth, this._width) }).parent().show(); }

                if (this._height <= this._containerHeight) { this._scrollY.parent().hide(); }
                else { this._scrollY.css({ height: this._getScrollbarLength(this._containerHeight, this._height) }).parent().show(); }

                this._setScrollbarMargin("x", this._convertToScrollbarMargin("x", this._setMargin("x", parseFloat(this._scrollX.css("margin-left")))));
                this._setScrollbarMargin("y", this._convertToScrollbarMargin("y", this._setMargin("y", parseFloat(this._scrollY.css("margin-top")))));
            }
        },
        _mousedown: function (sender, event)
        {
            this._mousestart = { sender: (sender = $(sender)), event: event };

            switch (sender.attr("direction"))
            {
                case "x":
                    this._mousestart.event.marginLeft = parseInt(sender.css("margin-left"));
                    break;
                case "y":
                    this._mousestart.event.marginTop = parseInt(sender.css("margin-top"));
                    break;
                default:
                    this._mousestart.event.marginLeft = parseInt(sender.css("margin-left"));
                    this._mousestart.event.marginTop = parseInt(sender.css("margin-top"));
                    break;
            }
        },
        _mouseup: function(sender, event)
        {
            this._mousestart = null;
        },
        _mousemove: function (sender, event)
        {
            if (this._mousestart == null) { return; }

            var _event = this._mousestart.event;
            var _sender = this._mousestart.sender;
            var _direction = _sender.attr("direction");

            switch (_direction)
            {
                case "x":
                    var marginLeft = this._setScrollbarMargin(_direction, _event.marginLeft + event.pageX - _event.pageX);
                    this._setMargin(_direction, this._convertFromScrollbarMargin(_direction, marginLeft));
                    break;
                case "y":
                    var marginTop = this._setScrollbarMargin(_direction, _event.marginTop + event.pageY - _event.pageY);
                    this._setMargin(_direction, this._convertFromScrollbarMargin(_direction, marginTop));
                    break;
                default:
                    var marginLeft = this._setMargin("x", _event.marginLeft + event.pageX - _event.pageX);
                    var marginTop = this._setMargin("y", _event.marginTop + event.pageY - _event.pageY);

                    this._setScrollbarMargin("x", this._convertToScrollbarMargin("x", marginLeft));
                    this._setScrollbarMargin("y", this._convertToScrollbarMargin("y", marginTop));

                    break;
            }
        },
        _convertFromScrollbarMargin: function (direction, margin)
        {
            var option = this.options.scrollbar.holder;

            switch (direction)
            {
                case "x":
                    var percentage = (margin - option.margin) / (this._containerWidth - this._scrollX.outerWidth() - 2 * option.margin);
                    margin = percentage * (this._containerWidth - this._width);
                    break;
                case "y":
                    var percentage = (margin - option.margin) / (this._containerHeight - this._scrollY.outerHeight() - 2 * option.margin);
                    margin = percentage * (this._containerHeight - this._height);
                    break;
            }

            return margin;
        },
        _convertToScrollbarMargin: function (direction, margin)
        {
            var option = this.options.scrollbar.holder;

            switch (direction)
            {
                case "x":
                    var percentage = margin / (this._containerWidth - this._width);
                    margin = percentage * (this._containerWidth - this._scrollX.outerWidth() - 2 * option.margin) + option.margin;
                    break;
                case "y":
                    var percentage = margin / (this._containerHeight - this._height);
                    margin = percentage * (this._containerHeight - this._scrollY.outerHeight() - 2 * option.margin) + option.margin;
                    break;
            }

            return margin;
        },
        _setMargin: function (direction, margin)
        {
            switch (direction)
            {
                case "x":
                    if (margin < this._containerWidth - this._width) { margin = this._containerWidth - this._width; }
                    if (margin > 0) { margin = 0; }
                    this.sender.css({ marginLeft: parseInt(margin) });
                    break;
                case "y":
                    if (margin < this._containerHeight - this._height) { margin = this._containerHeight - this._height; }
                    if (margin > 0) { margin = 0; }
                    this.sender.css({ marginTop: parseInt(margin) });
                    break;
            }

            return margin;
        },
        _setScrollbarMargin: function (direction, margin)
        {
            var option = this.options.scrollbar.holder;

            switch (direction)
            {
                case "x":
                    if (margin < option.margin) { margin = option.margin; }
                    if (margin > this._containerWidth - this._scrollX.outerWidth() - option.margin) { margin = this._containerWidth - this._scrollX.outerWidth() - option.margin; }
                    $(this._scrollX).css({ marginLeft: parseInt(margin) });
                    break;
                case "y":
                    if (margin < option.margin) { margin = option.margin; }
                    if (margin > this._containerHeight - this._scrollY.outerHeight() - option.margin) { margin = this._containerHeight - this._scrollY.outerHeight() - option.margin; }
                    $(this._scrollY).css({ marginTop: parseInt(margin) });
                    break;
            }

            return margin;
        },
        _getScrollbarLength: function (range, width)
        {
            if (this.options.scrollbar.holder.length != "auto")
            {
                return this.options.scrollbar.holder.length;
            }

            if (width == 0 || width <= range) { return 0; }
            return range / width * (range - 4 * this.options.scrollbar.margin);
        },
        _generateContainer: function (parent)
        {
            this._container = $("<div></div>");
            this._container.addClass("ui-draggazilla-container");
            this._container.css({ height: this._containerHeight, overflow: "hidden", width: this._containerWidth });
            this._container.appendTo(parent);
        },
        _generateScrollbar: function ()
        {
            this._scrollYContainer = $("<div></div>");
            this._scrollYContainer.addClass("ui-draggazilla-line ui-draggazilla-line-y");
            this._scrollYContainer.css({ background: this.options.scrollbar.line.color, float: "right", height: this._containerHeight, marginRight: this.options.scrollbar.line.margin, marginTop: -this._containerHeight, width: this.options.scrollbar.line.width });
            this._scrollYContainer.hide().appendTo(this._parent);

            this._scrollY = $("<div></div>");
            this._scrollY.attr({ direction: "y" }).addClass("ui-draggazilla-holder ui-draggazilla-holder-y");
            this._scrollY.css({ background: this.options.scrollbar.holder.color, borderRadius: this.options.scrollbar.holder.borderRadius, marginLeft: -0.5 * (this.options.scrollbar.holder.width + 2 * (this.options.scrollbar.holder.padding) - this.options.scrollbar.line.width), padding: this.options.scrollbar.holder.padding, width: this.options.scrollbar.holder.width });
            this._scrollY.appendTo(this._scrollYContainer);

            this._scrollXContainer = $("<div></div>");
            this._scrollXContainer.addClass("ui-draggazilla-line ui-draggazilla-line-x");
            this._scrollXContainer.css({ background: this.options.scrollbar.line.color, float: "left", height: this.options.scrollbar.line.width, marginTop: -(this.options.scrollbar.line.width + this.options.scrollbar.line.margin), width: this._containerWidth });
            this._scrollXContainer.hide().appendTo(this._parent);

            this._scrollX = $("<div></div>");
            this._scrollX.attr({ direction: "x" }).addClass("ui-draggazilla-holder ui-draggazilla-holder-x");
            this._scrollX.css({ background: this.options.scrollbar.holder.color, borderRadius: this.options.scrollbar.holder.borderRadius, height: this.options.scrollbar.holder.width, marginTop: -0.5 * (this.options.scrollbar.holder.width + 2 * (this.options.scrollbar.holder.padding) - this.options.scrollbar.line.width), padding: this.options.scrollbar.holder.padding });
            this._scrollX.appendTo(this._scrollXContainer);
        }
    };

    draggazilla.prototype.constructor = draggazilla;

    $.fn.extend(
    {
        draggazilla: function (options)
        {
            return new draggazilla(this, options).init();
        }
    });
})(jQuery);
