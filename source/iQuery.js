//
//                >>>  iQuery.js  <<<
//
//
//      [Version]    v1.0  (2016-05-19)  Stable
//
//      [Usage]      A Light-weight jQuery Compatible API
//                   with IE 8+ compatibility.
//
//
//          (C)2015-2016    shiy2008@gmail.com
//


define([
    'extension/iBrowser', 'iObject', 'iUtility', 'extension/iUtility',
    'iCore', 'iEvent', 'extension/iEvent', 'extension/IE-8',
    'extension/iDOM', 'extension/iCSS', 'extension/iSelection',
    'iAnimation', 'iAJAX',
    'extension/HTML-5', 'extension/HTML-5_Form'
],  function ($) {

    var BOM = self;

    if (typeof BOM.jQuery != 'function')  BOM.$ = BOM.jQuery = $;

    return $;

});