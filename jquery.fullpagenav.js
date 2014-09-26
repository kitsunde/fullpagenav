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

  var instances = {};

  var defaults = {
    columns: 5,
    selector: "> li",
    hoverSize: 30,
    animateDuration: 500,
    easing: "linear",
    animateFrom: "left",
    clickable: true,
    afterClicked: null
  };

  var dimensions;

  $.fn.recalculate = function(settings) {
    var el = $(this);
    var totalWidth = 0;
    var unexpandedWidth;
    var $slides = el.find(settings.selector);
    var containerWidth = $(this).parent().width();
    var expandedWidth = $slides.hasClass("fpn_clicked") ? 100 : settings.hoverSize;

    if(expandedWidth !== 100){
      if(el.hasClass("expanded") || el.hasClass("expanding")){
        el.trigger($.Event("shrinking.fullpagenav", {relatedTarget: this}));
      }
      el.removeClass("expanded expanding");
    }

    if(expandedWidth === 100){
      el.addClass("expanding");
    }

    if(expandedWidth === 100){
      unexpandedWidth = 0;
    }else if($slides.hasClass("active")){
      unexpandedWidth = (100 - settings.hoverSize) / (dimensions.length - 1);
    }else{
      unexpandedWidth = 100 / dimensions.length;
    }

    $slides.each(function() {
      var targetWidth = 0;
      if($(this).hasClass("active")){
        targetWidth = expandedWidth;
        if(targetWidth === 100){
          el.trigger($.Event("expanding.fullpagenav", {relatedTarget: this}));
        }
      }else{
        targetWidth = unexpandedWidth;
      }
      $(this).stop().animate({
        left: totalWidth + '%',
        width: targetWidth + "%"
      }, settings.animateDuration, settings.easing, function(){
        if(targetWidth === 100){
          el.trigger($.Event("expanded.fullpagenav", {relatedTarget: this}));
          el.addClass("expanded");
        }
      })
        .find(".fn_wrap")
        .css({
          width: parseInt(containerWidth * (100 / targetWidth))
        });

      totalWidth += targetWidth;
    });
  };

  function determineDirection($el, pos) {
    var w = $el.width(),
      middle = $el.offset().left + w / 2;
    return (pos.pageX > middle ? 0 : 1);
  }

  $.fn.fullpagenav = function(options, page) {
    var el = $(this);
    if(instances[el]){
      settings = instances[el].settings;
    }else{
      instances[el] = {}
    }
    if(options === "next"){
      el.find(settings.selector)
        .filter(".active")
        .removeClass("active fpn_clicked")
        .next()
        .addClass("active fpn_clicked");
      el.recalculate(settings);
      return el;
    }
    if(options === "prev"){
      el.find(settings.selector)
        .filter(".active")
        .removeClass("active fpn_clicked")
        .prev()
        .addClass("active fpn_clicked");
      el.recalculate(settings);
      return el;
    }
    if(options === "page"){
      el.find(settings.selector)
        .filter(".active")
        .removeClass("active fpn_clicked")
        .end()
        .eq(page - 1)
        .addClass("active fpn_clicked");
      el.recalculate(settings);
      return el;
    }

    var settings = $.extend({}, defaults, options);
    instances[el].settings = settings;
    var $slides = $(settings.selector, this);

    dimensions = $.map($slides, function(item, index) {
      var width = 100 / $slides.length;
      return {left: width * index, width: width};
    });

    el.addClass("fullpagenav");
    $slides.addClass("fpn_li");
    el.parent().addClass("fpn_body");

    el.recalculate(settings);
    $slides.finish();

    $slides
      .wrapInner("<div class='fpn_wrap'></div>")
      .click(function() {
        if(!$(this).hasClass("fpn_clicked")){
          $(this).addClass("fpn_clicked");
          settings.hoverSize = 100;
          el.recalculate(settings);
          return false;
        }else{
          $(this).removeClass("fpn_clicked");
          settings.hoverSize = 30;
          el.recalculate(settings);
        }
      }).mouseenter(function(e) {
        if($(this).hasClass("fpn_clicked")){
          return false;
        }
        $(this).addClass("active");
        var floatDirection;

        el.recalculate(settings);
        if(settings.animateFrom === "auto"){
          floatDirection = determineDirection(li, e) === 1 ? "left" : "right";
        }else{
          floatDirection = settings.animateFrom;
        }
        $(this).find(".fpn_wrap").css({"float": floatDirection});
      }).mouseleave(function() {
        if($(this).hasClass("fpn_clicked")){
          return false;
        }
        $(this).removeClass("active");
        el.recalculate(settings);
      });
  };
})(window.jQuery);

