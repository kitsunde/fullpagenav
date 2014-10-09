/* ===========================================================
 * jquery-fullpagenav.js v1
 * ===========================================================
 * Copyright 2013 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * Divide animated navigation into columns
 * filling up the whole page with a simple JS call
 *
 * https://github.com/peachananr/fullpagenav
 *
 * ========================================================== */

(function($) {
  "use strict";

  var FullPageNav = function(element, options) {
    var that = this;
    this.$element = $(element);
    this.options = options;

    this.$items = this.$element.find(this.options.selector);
    this.$items.wrapInner("<div class='fpn_wrap'>");

    // @todo There's a CSS attribute that allows mouse events to flow through
    // which isn't widely supported on IE. On mot other browsers this
    // shouldn't be necessary.
    // We should probably introduce some option like
    // catchMoseEvents: 'css-unsupported' (default) / 'always' / false
    $("body").on("mousemove", function(e) {
      var inFocus = that.$items.filter(function(index, item) {
        var bounds = item.getBoundingClientRect();

        if(bounds.left > e.clientX || bounds.right < e.clientX ||
          bounds.top > e.clientY || bounds.bottom < e.clientY){
          return;
        }
        return true;
      });

      if(!inFocus.is(".highlight")){
        that.$items.filter(".highlight").trigger("mouseleave");
        inFocus.trigger("mouseenter");
      }
    });

    this.$element.on("mouseenter",
      this.options.selector,
      this.highlight.bind(this));

    this.$element.on("mouseleave",
      this.options.selector,
      this.unhighlight.bind(this));


    this.$element.on("click", this.options.selector, function(e) {
      e.preventDefault();
      if(!that.$items.hasClass("active")){
        that.show($(this));
      }
    });

    this.reflow(true);
  };

  FullPageNav.DEFAULTS = {
    selector: "> li",
    hoverSize: 30,
    animateDuration: 500,
    easing: "linear",
    animateFrom: "left"
  };

  FullPageNav.prototype.highlight = function(e) {
    if(this.$items.hasClass("active")){
      return;
    }
    this.$items.filter(".highlight").removeClass("highlight");
    $(e.currentTarget).addClass("highlight");

    this.reflow();
  };

  FullPageNav.prototype.unhighlight = function(e) {
    if(this.$items.hasClass("active") || !this.$items.hasClass("highlight")){
      return;
    }
    $(e.currentTarget).removeClass("highlight");
    this.reflow();
  };

  FullPageNav.prototype.getItemIndex = function(item) {
    this.$items = item.parent().children(this.options.selector);
    return this.$items.index(item || this.$active);
  };

  FullPageNav.prototype.next = function() {
    return this.show("next");
  };

  FullPageNav.prototype.prev = function() {
    return this.show("prev");
  };

  FullPageNav.prototype.show = function(next) {
    var direction = next.direction;
    var $next = next.direction ? next.show : next;
    var $active = $(this.options.selector, this.$element).filter(".active");

    if($active.length && !direction){
      direction = this.$items.index($active) < this.$items.index($next) ?
        "left" : "right";
    }
    var that = this;

    if(!$next.length){
      return this;
    }

    if($next.hasClass("active")){
      return this;
    }

    this.$element.addClass("fullpage");

    var relatedTarget = $next[0];

    var showEvent = $.Event("show.fullpagenav", {
      relatedTarget: relatedTarget
    });
    this.$element.trigger(showEvent);

    var shownEvent = $.Event("shown.fullpagenav", {
      relatedTarget: relatedTarget
    });

    $next.addClass("active");
    $active.removeClass("active");

    if($active.length){
      $next.css("left", direction === 'left' ? "100%" : "-100%");
      $active
        .add($next)
        .addClass(direction + " animate")
        .animate({left: (direction === 'left'? '-' : '+') + '=100%'},
        that.options.animateDuration,
        that.options.easing);
      $next.promise().done(function() {
        $active.add($next).removeClass("animate left right");
        that.$element.trigger(shownEvent);
      });
    }else{
      this.reflow().done(function() {
        that.$element.trigger(shownEvent);
        that.$items.attr("style", null);
      });
    }
    return this;
  };

  FullPageNav.prototype.close = function() {
    var $active = $(this.options.selector, this.$element).filter(".active");
    var that = this;
    if(!$active.length){
      return this;
    }
    $active
      .removeClass("active")
      .css({width: "100%", left: "0%"})
      .prevAll("li").css("left", "0%").end()
      .nextAll("li").css("left", "100%");

    this.$element.removeClass("fullpage");

    var collapseEvent = $.Event("collapse.fullpagenav");
    this.$element.trigger(collapseEvent);

    var collapsedEvent = $.Event("collapsed.fullpagenav");

    this.reflow().done(function() {
      $(that).trigger(collapsedEvent);
    });
    return this;
  };

  FullPageNav.prototype.to = function(pos) {
    this.$active = this.$element.find(".active");

    if(pos > (this.$items.length - 1) || pos < 0){
      return this;
    }

    return this.show(this.$items.eq(pos));
  };

  FullPageNav.prototype.reflow = function(instantly) {
    var options = this.options;
    var primaryItemWidth;
    var itemWidth;
    var offset = 0;
    var that = this;
    var expanding = this.$items.hasClass("active");

    if(!expanding){
      var remainingWidth = 100;
      var normal = 0;

      this.$items.each(function() {
        if($(this).hasClass("highlight")){
          remainingWidth -= that.options.hoverSize;
        }else if($(this).data('fullpagenav-width')){
          remainingWidth -= $(this).data('fullpagenav-width');
        }else{
          normal++;
        }
      });
      itemWidth = remainingWidth / normal;
    }

    var animations = this.$items.map(function() {
      var targetWidth = 0;
      var $item = $(this);
      if(expanding){
        targetWidth = $item.hasClass("active") ? 100 : 0;
      }else{
        if($item.hasClass("highlight")){
          targetWidth = that.options.hoverSize;
        }else{
          targetWidth = $item.data("fullpagenav-width") || itemWidth;
        }
      }

      var animation = $item.stop().animate({
        left: offset + "%",
        width: targetWidth + "%"
      }, options.animateDuration, options.easing);
      offset += targetWidth;
      return animation;
    });

    var promise = $.when.apply(this, animations);
    if(instantly){
      $.each(animations, function(){this.finish()});
    }
    return promise;
  };

  function Plugin(option, actionOption) {
    return this.each(function() {
      var $this = $(this);
      var data = $this.data("fullpagenav");
      var options = $.extend({}, FullPageNav.DEFAULTS, $this.data(),
          typeof option === "object" && option);

      var action = typeof option === "string" ? option : "reflow";

      if(!data) {
        $this.data("fullpagenav", (data = new FullPageNav(this, options)));
      }
      if(typeof option === "number"){
        data.to(option);
      }else{
        data[action](actionOption);
      }
    });
  }

  $(document).on('click', '[data-fullpagenav-to]', function(e) {
    var $this = $(this);
    var $target = $($this.data('fullpagenav-target'));
    if(!$target.hasClass('fullpagenav')) return;

    Plugin.apply($target, ["show", {
      show: $($this.data('fullpagenav-to')),
      direction: $this.data('fullpagenav-direction')
    }
    ]);

    e.preventDefault();
  });

  $.fn.fullpagenav = Plugin;
})(window.jQuery);
