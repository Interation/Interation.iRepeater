(function ($)
{
    var draggazilla = function (sender, options)
    {
        this.sender = $(sender);

        options = options || {};
        options.dragging = options.dragging || {};
        options.dragging.can = options.dragging.can != false;
        options.scrolling = options.scrolling || {};
        options.scrolling.can = options.scrolling.can == true;
        options.scrolling.width = isNaN(options.scrolling.width) ? 10 : options.scrolling.width;
        options.scrolling.borderRadius = isNaN(options.scrolling.borderRadius) ? 5 : options.scrolling.borderRadius;
        options.scrolling.margin = isNan(options.scrolling.margin) ? 3 : options.scrolling.margin;
        options.scrolling.color = options.scrolling.color || "#000000";
        options.scrolling.opacity = isNaN(options.scrolling.opacity) ? 0.5 : options.scrolling.opacity;
        options.tabular = options.tabular || {};
        options.tabular.is = this.sender.is("table");
        options.tabular.rows = options.tabular.rows || 0;
        options.tabular.columns = options.tabular.columns || 0;

        this.options = options;
    };

    draggazilla.prototype =
    {
        init: function ()
        {
            this.sender = $(this.sender);
            this.options = this.options || {};
            this.options.dragging = this.options.dragging || {};
            this.options.dragging.can = this.options.dragging.can != false;
            this.options.scrolling = this.options.scrolling || {};
            this.options.scrolling.enabled = this.options.scrolling.enabled == true;
            this.options.scrolling.width = isNaN(this.options.scrolling.width) ? 10 : this.options.scrolling.width;
            this.options.scrolling.borderRadius = isNaN(this.options.scrolling.borderRadius) ? 5 : this.options.scrolling.borderRadius;
            this.options.scrolling.margin = isNan(this.options.scrolling.margin) ? 3 : this.options.scrolling.margin;
            this.options.scrolling.color = this.options.scrolling.color || "#000000";
            this.options.scrolling.opacity = isNaN(this.options.scrolling.opacity) ? 0.5 : this.options.scrolling.opacity;
            this.options.fixing = this.options.fixing || {};
            this.options.fixing.rows = this.options.fixing.rows || 0;
            this.options.fixing.columns = this.options.fixing.columns || 0;
            this.options.fixing.height = this.options.fixing.height || 0;
            this.options.fixing.width = this.options.fixing.width || 0;

            return this;
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
