"use strict";var Setup;(Setup=function(r){return r(function(){return r("#search").click(function(t){var e;return e=r("#word")[0].value,jQuery.get("/list/".concat(e,"/1"),function(t){return console.log(t),r("#results").empty().append(t)})})})})(jQuery);