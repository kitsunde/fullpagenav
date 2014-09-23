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
    animateFrom: "left",
    clickable: true,
    afterClicked: null
  };

  $.fn.recalculate = function(settings, width) {
    var el = $(this),
      active = false,
      totalWidth = 0;

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
          }, settings.animateDuration, function() {
            $(this).css({
              left: left + "%"
            });
          });

          totalWidth = totalWidth + parseFloat(w);
        }
      });
    }else{
      el.find(settings.selector).each(function(index) {
        $(this).finish().animate({
          width: width + "%",
          left: (width * index) + "%"
        }, settings.animateDuration);
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

    el.addClass("fullpagenav").find(settings.selector).addClass("fpn_li");
    el.parent().addClass("fpn_body");


    el.find(settings.selector).each(function(index) {
      var li = $(this);


      li.css({
        width: width + "%",
        left: (width * index) + "%"
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
            });


            li.find(".fpn_wrap").addClass("fpn_clicked")
              .css({position: "fixed", "z-index": 99})
              .finish()
              .animate({
                width: "100%", top: 0, left: 0
              }, settings.animationDuration, function() {
                e.preventDefault();
                if(typeof settings.afterClicked === "function"){
                  return settings.afterClicked(li.data("link"));
                }
                window.location.href = li.data("link");
              });
          }else{
            li.find(".fpn_wrap").removeClass("fpn_clicked").finish().animate({
              width: "0%", top: 0, left: 0, height: "0%"
            }, settings.animationDuration, function() {
              $(this).attr("style", "").find("> img").attr("style", "");
            });
          }
        });
      }

      li.mouseenter(function(e) {
        if(!li.find(".fpn_wrap").hasClass("fpn_clicked")){
          $(this).finish().addClass("active");
          el.recalculate(settings, width);
          if(settings.animateFrom === "auto"){

            if(determineDirection(li, e) === 1){
              $(this).find(".fpn_wrap").finish()
                .css({ float: "left"})
                .animate({width: el.find(".fpn_li.active").width()},
                settings.animateDuration);
            }else{
              $(this).find(".fpn_wrap").finish()
                .css({ float: "right"})
                .animate({width: el.find(".fpn_li.active").width()},
                settings.animateDuration);
            }
          }else{
            $(this).find(".fpn_wrap").finish()
              .css({ float: settings.animateFrom})
              .animate({width: el.find(".fpn_li.active").width()},
              settings.animateDuration);
          }
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

