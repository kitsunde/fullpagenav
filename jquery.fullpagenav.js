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

  function getTransitionEndEvent() {
    var el = document.createElement('fullpagenav');

    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };

    for(var name in transEndEventNames){
      if(el.style[name] !== undefined){
        return transEndEventNames[name];
      }
    }
  }

  var FullPageNav = function(element, options) {
    this.$element = $(element);
    this.options = options;

    this.$items = this.$element.find(this.options.selector);
    this.$items.wrapInner("<div class='fpn_wrap'>");

    this.$element.on("mouseenter",
      this.options.selector,
      this.highlight.bind(this));

    this.$element.on("mouseleave",
      this.options.selector,
      this.unhighlight.bind(this));

    var that = this;
    this.$element.on("click", this.options.selector, function(e) {
      e.preventDefault();
      if(!that.$items.hasClass("active")){
        that.show($(this));
      }
    });

    this.reflow();
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
    $(e.currentTarget).addClass("highlight");
    this.reflow();
  };

  FullPageNav.prototype.unhighlight = function(e) {
    if(this.$items.hasClass("active")){
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

  FullPageNav.prototype.show = function($next) {
    var $active = $(this.options.selector, this.$element).filter(".active");
    if($active.length){
      var direction = this.$items.index($active) < this.$items.index($next) ?
        'left' : 'right';
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

    var showEvent = $.Event('show.fullpagenav', {
      relatedTarget: relatedTarget
    });
    this.$element.trigger(showEvent);

    var shownEvent = $.Event('shown.fullpagenav', {
      relatedTarget: relatedTarget
    });

    $next.addClass("active");
    $active.removeClass("active");

    if($active.length){
      $active.add($next).addClass(direction);

      $active.one(getTransitionEndEvent(), function() {
        $active.add($next).removeClass("animate left right");
        $active[0].offsetWidth;
        that.$element.trigger(shownEvent);
      });

      $active.add($next).addClass("animate");
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
    if(!$active.length){
      return this;
    }
    $active.removeClass("active");
    this.$element.removeClass("fullpage");
    this.reflow();
    return this;
  };

  FullPageNav.prototype.to = function(pos) {
    this.$active = this.$element.find('.active');

    if(pos > (this.$items.length - 1) || pos < 0){
      return;
    }

    return this.show(this.$items.eq(pos));
  };

  FullPageNav.prototype.reflow = function() {
    var options = this.options;
    var primaryItemWidth;
    var itemWidth;
    var offset = 0;

    if(this.$items.hasClass("active")){
      itemWidth = 0;
      primaryItemWidth = 100;
    }else if(this.$items.hasClass("highlight")){
      primaryItemWidth = this.options.hoverSize;
      itemWidth = (100 - primaryItemWidth) / (this.$items.length - 1);
    }else{
      itemWidth = 100 / this.$items.length;
    }

    var animations = this.$items.map(function() {
      var targetWidth = 0;
      var $item = $(this);
      if($item.hasClass("active") || $item.hasClass("highlight")){
        targetWidth = primaryItemWidth;
      }else{
        targetWidth = itemWidth;
      }

      var animation = $item.stop().animate({
        left: offset + "%",
        width: targetWidth + "%"
      }, options.animateDuration, options.easing);
      offset += targetWidth;
      return animation;
    });

    return $.when.apply(this, animations);
  };

  function Plugin(option, actionOption) {
    return this.each(function() {
      var $this = $(this);
      var data = $this.data('fullpagenav');
      var options = $.extend({}, FullPageNav.DEFAULTS, $this.data(),
          typeof option == 'object' && option);

      var action = typeof option === 'string' ? option : 'reflow';

      if(!data) $this.data('fullpagenav',
        (data = new FullPageNav(this, options)));
      if(typeof option == 'number'){
        data.to(option);
      }else{
        data[action](actionOption);
      }
    });
  }

  $.fn.fullpagenav = Plugin;
})(window.jQuery);
