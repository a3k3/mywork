/**
 * Webcam Directive
 *
 * (c) Jonas Hartmann http://jonashartmann.github.io/webcam-directive
 * License: MIT
 *
 * @version: 3.1.0
 */
'use strict';

(function () {
    // GetUserMedia is not yet supported by all browsers
    // Until then, we need to handle the vendor prefixes
    navigator.getMedia = (navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

    // Checks if getUserMedia is available on the client browser
    window.hasUserMedia = function hasUserMedia() {
        return navigator.getMedia ? true : false;
    };
})();