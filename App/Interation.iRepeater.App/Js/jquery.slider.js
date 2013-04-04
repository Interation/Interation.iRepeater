(function ($)
{
    var slider = function (target, options)
    {
        this.target = $(target);

        options = options || {};
        options.start = options.start || 0;
        options.end = options.end || 1;
        options.value = options.value || 0;
        options.bar = options.bar || {};
        options.bar.backgroundColor = options.bar.backgroundColor || "#cccccc";
        options.bar.foregroundColor = options.bar.foregroundColor || "#777777";
        options.controller = options.controller || {};
        options.controller.backgroundColor = options.controller.backgroundColor || "transparent";

        options.mousedown = options.mousedown || null;
        options.mouseup = options.mouseup || null;
        options.mousemove = options.mousemove || null;
        options.change = options.change || null;

        this.options = options;
    };

    slider.prototype =
    {
        init: function ()
        {
            var _this = this;
            var controllerBackground = this.options.controller.backgroundColor;
            this.height = this.target.height();
            this.width = this.target.width();
            this.controllerRadius = this.height;

            this.target.bind("selectstart", function () { return false; });

            this.bar = $("<div></div>").addClass("ui-slider-bar").appendTo(this.target);
            this.bar.css({ backgroundColor: this.options.bar.backgroundColor, borderRadius: this.height, height: this.height, overflow: "hidden", width: this.width });
            this.bar.mousedown(function (event) { _this._mousedown(this, event); }).bind("drag", function () { return false; });

            this.innerBar = $("<div></div>").addClass("ui-slider-innerbar").appendTo(this.bar);
            this.innerBar.css({ backgroundColor: this.options.bar.foregroundColor, borderRadius: 0, height: this.height, width: 0 });
            this.innerBar.bind("drag", function () { return false; });

            this.controller = $("<a></a>").addClass("ui-slider-controller").attr({ href: "javascript:void(0);" }).appendTo(this.target);
            this.controller.css({ backgroundColor: controllerBackground, borderRadius: this.controllerRadius * 2, height: 2 * this.controllerRadius, position: "absolute", width: 2 * this.controllerRadius });
            this.controller.css({ marginLeft: -this.controllerRadius, marginTop: -2 * this.controllerRadius + (this.controllerRadius - 0.5 * this.height) });
            this.controller.mousedown(function (event) { _this._mousedown(this, event); }).bind("drag", function () { return false; });

            $(window).mousemove(function (event) { _this._mousemove(this, event); }).mouseup(function (event) { _this._mouseup(this, event); });
            this._slideTo(this._getPosition(this.options.value));

            return this;
        },
        reset: function(start, end, value)
        {
            this.options.start = start;
            this.options.end = end;

            this._slideTo(this._getPosition(value));
        },
        setValue: function (value)
        {
            if (this._sliding) { return; }
            this._moveTo(this._getPosition(value));
        },
        _setValue: function (value)
        {
            var min = Math.min(this.options.start, this.options.end);
            var max = Math.max(this.options.start, this.options.end);

            if (value < min) { value = min; }
            else if (value > max) { value = max; }

            this._tryTrigger("change", value);

            return value;
        },
        _getValue: function (position)
        {
            position = position || parseInt(this.controller.css("margin-left")) + this.controllerRadius;
            return (this.options.end - this.options.start) * (position / this.width);
        },
        _getPosition: function (value)
        {
            var min = Math.min(this.options.start, this.options.end);
            var max = Math.max(this.options.start, this.options.end);

            if (value < min) { value = min; }
            else if (value > max) { value = max; }

            return (value - min) / (max - min) * this.width;
        },
        _slideTo: function (position)
        {
            this._moveTo(position);
            return this._setValue(this._getValue(position));
        },
        _moveTo: function (position)
        {
            this.innerBar.css({ width: position });
            this.controller.css({ marginLeft: position - this.controllerRadius });
        },
        _tryTrigger: function(event, value)
        {
            if (typeof this.options[event] == "function")
            {
                this.options[event](value);
            }
        },
        _mousedown: function (sender, event)
        {
            sender = $(sender);

            this._sliding = true;
            this._mouseStart = { pageX: event.pageX };

            if (sender.hasClass("ui-slider-controller"))
            {
                this._positionStart = { left: parseInt(sender.css("margin-left")) + this.controllerRadius };
            }
            else
            {
                this._positionStart = { left: event.pageX - sender.offset().left };
            }

            this._tryTrigger("mousedown", this._slideTo(this._positionStart.left));
        },
        _mouseup: function (sender, event)
        {
            var _this = this;

            this._sliding = false;
            this._tryTrigger("mouseup", this._slideTo(this._getPosition(this._getValue())));
        },
        _mousemove: function (sender, event)
        {
            if (this._sliding === true)
            {
                var _this = this;
                var position = this._positionStart.left + event.pageX - this._mouseStart.pageX;

                if (position > this.width) { position = this.width; }
                else if (position < 0) { position = 0; }

                this._tryTrigger("mousemove", this._slideTo(position));
            }
        }
    };

    slider.prototype.constructor = slider;

    $.fn.extend(
    {
        slider: function (options)
        {
            return new slider(this, options).init();
        }
    });
})(jQuery);
