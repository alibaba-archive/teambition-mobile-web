/* global module, define */
;(function (root, factory) {
  'use strict';
  var request;

  if (typeof module === 'object' && typeof module.exports === 'object') {
    // try {
    //   request = require('./lib/node_request.js'); // node server request
    // } catch (e) {}
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {return factory();});
  } else {
    root.Spiderjs = factory();
  }
}(this, function (request) {
  'use strict';

  var hasOwn = Object.prototype.hasOwnProperty;
  var base64Str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var  _options = {
      host: 'spider.teambition.com/api/track',
      _userId: '',
      client: ''
    };

  request = request || function (url) {
    if (!url) return;
    var img = new Image();
    img.onload = img.onerror = img.abort = function () {
      img = img.onload = img.onerror = img.abort = null;
    };
    img.src = url;
  };

  function utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n');
    var utftext = '';

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) utftext += String.fromCharCode(c);
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  }

  function base64Encode(input) {
    var output = '';
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = utf8Encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) enc3 = enc4 = 64;
      else if (isNaN(chr3)) enc4 = 64;

      output = output +
        base64Str.charAt(enc1) + base64Str.charAt(enc2) +
        base64Str.charAt(enc3) + base64Str.charAt(enc4);
    }

    return output;
  }

  function each(obj, iterator, context) {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        iterator.call(context, obj[key], key, obj);
      }
    }
    return obj;
  }

  function genURL(title, obj) {
    var url = '';
    var data = {
      _userId: _options._userId,
      client: _options.client
    };

    if (title) data.event = title;
    if (obj) data.properties = obj;

    if (_options.host && data._userId && data.client) {
      if (_options.host.indexOf('http') < 0) {
        url += document && 'https:' === document.location.protocol ? 'https://' : 'http://';
      }
      url += _options.host + '?data=' + base64Encode(JSON.stringify(data));
    }
    return url;
  }

  function Spiderjs(options) {
    each(options, function (value, key) {
      _options[key] = value;
    });
    this.init();
  }

  Spiderjs.prototype.init = function () {
    request(genURL());
  };

  Spiderjs.prototype.track = function (title, obj) {
    try {
      var json = JSON.stringify(obj);
    } catch (e) {
      obj = null;
    }

    if (title && typeof title === 'string') request(genURL(title, obj));
  };

  Spiderjs.btoa = base64Encode;

  return Spiderjs;

}));
