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

  var defaults = {
    columns: 5,
    selector: "> li",
    hoverSize: "30%",
    animateDuration: 500,
    easing: "linear",
    animateFrom: "left",
    clickable: true,
    afterClicked: null
  };

  var dimensions;
  var $slides;

  $.fn.recalculate = function(settings, width) {
    var el = $(this), totalWidth = 0;

    if(el.find(".fpn_li.active").length > 0){

      el.find(".fpn_li.active").css({
        width: settings.hoverSize
      });

      var smallWidth = (100 - parseFloat(settings.hoverSize)) /
        (settings.columns - 1);

      el.find(".fpn_li:not(.active)").css({
        width: smallWidth + "%"
      });


      el.find(settings.selector).each(function() {
        var $column = $(this).prev(".fpn_li");
        if($column.length > 0){
          var w = $column.hasClass("active") ? settings.hoverSize : smallWidth;
          var left = totalWidth + parseFloat(w);

          $(this).finish().animate({
            left: left + "%"
          }, settings.animateDuration, settings.easing);

          totalWidth = totalWidth + parseFloat(w);
        }
      });
    }else{
      el.find(settings.selector).each(function(index) {
        $(this).finish().animate({
          width: width + "%",
          left: (width * index) + "%"
        }, settings.animateDuration, settings.easing);
      });
    }
  };

  function determineDirection($el, pos) {
    var w = $el.width(),
      middle = $el.offset().left + w / 2;
    return (pos.pageX > middle ? 0 : 1);
  }

  $.fn.fullpagenav = function(options) {
    var settings = $.extend({}, defaults, options),
      el = $(this),
      width = 100 / settings.columns;
    $slides = $(settings.selector, this);

    dimensions = $.map($slides, function(item, index) {
      var width = 100 / $slides.length;
      return {left: width * index, width: width};
    });

    el.addClass("fullpagenav");
    $slides.addClass("fpn_li");
    el.parent().addClass("fpn_body");

    $slides.each(function(index) {
      var li = $(this);
      li.css({
        width: dimensions[index].width + "%",
        left: dimensions[index].left + "%"
      });

      li.wrapInner("<div class='fpn_wrap'></div>");

      if(settings.clickable === true && li.data("link")){
        li.css({cursor: "pointer"}).click(function(e) {
          if(!li.find(".fpn_wrap").hasClass("fpn_clicked")){
            li.find(".fpn_wrap > img").css({
              margin: 0,
              padding: 0,
              left: 0,
              maxHeight: "inherit"
            }).animate({
              width: "100%"
            }, settings.animateDuration, settings.easing);


            li.find(".fpn_wrap").addClass("fpn_clicked")
              .css({position: "fixed", "z-index": 99})
              .finish()
              .animate({
                width: "100%",
                top: 0,
                left: 0
              }, settings.animateDuration, settings.easing, function() {
                e.preventDefault();
                if(typeof settings.afterClicked === "function"){
                  return settings.afterClicked(li.data("link"));
                }
                window.location.href = li.data("link");
              });
          }else{
            li.find(".fpn_wrap").removeClass("fpn_clicked").finish().animate({
              width: "0%", top: 0, left: 0, height: "0%"
            }, settings.animateDuration, settings.easing, function() {
              $(this).attr("style", "").find("> img").attr("style", "");
            });
          }
        });
      }

      li.mouseenter(function(e) {
        if(!li.find(".fpn_wrap").hasClass("fpn_clicked")){
          $(this).finish().addClass("active");
          var floatDirection;

          el.recalculate(settings, width);
          if(settings.animateFrom === "auto"){
            floatDirection = determineDirection(li, e) === 1 ? "left" : "right";
          }else{
            floatDirection = settings.animateFrom;
          }
          $(this).find(".fpn_wrap")
            .finish()
            .css({"float": floatDirection})
            .animate({width: el.find(".fpn_li.active").width()},
            settings.animateDuration,
            settings.easing);
        }

      }).mouseleave(function() {
        if(!li.find(".fpn_wrap").hasClass("fpn_clicked")){
          $(this).removeClass("active");
          el.recalculate(settings, width);
          el.find(".fpn_wrap").finish().css({width: "100%"});
        }
      });
    });
  };
})(window.jQuery);

