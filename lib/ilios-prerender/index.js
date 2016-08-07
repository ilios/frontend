/* eslint-env node */

module.exports = {
  name: 'ilios-prerender',
  contentFor: function(type, config) { // eslint-disable-line no-unused-vars
    if (type === 'body-footer') {
      return `<script src="${config.rootURL}ilios-prerender/scripts.js"></script>`;
    }
    if (type === 'test-body-footer') {
      return `<script src="${config.rootURL}ilios-prerender/test-scripts.js"></script>`;
    }

    if( type === 'body') {
      return "<div id='initialpageloader' class='ember-load-indicator'>" +
        "<header class='main'>" +
          "<div class='logo'>" +
            "<span class='image'></span>" +
          "</div>" +
        "</header>" +
        "<div id='site-container'>" +
          "<h1>" +
            "<i class='fa fa-spinner fa-pulse fa-3x'></i>" +
          "</h1>" +
          "<p id='browsererrormessage' class='hidden'>" +
            "It is possible that your browser is not supported by Ilios.  " +
            "Please refresh this page or try a different browser." +
          "</p>" +
          "</div>" +
        "</div>" +
      "</div>";
    }
  }
};
