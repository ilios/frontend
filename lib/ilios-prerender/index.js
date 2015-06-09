module.exports = {
  name: 'ilios-prerender',
  contentFor: function(type, config) {
    if (type === 'body-footer') {
      return '<script src="ilios-prerender/scripts.js"></script>';
    }
    if (type === 'test-body-footer') {
      return '<script src="ilios-prerender/test-scripts.js"></script>';
    }

    if( type === 'body') {
      return "<div id='initialpageloader'>" +
        "<header class='main'>" +
          "<div class='logo'>" +
            "<span class='image'></span>" +
          "</div>" +
          "<h1>" +
            "<i class='fa fa-spinner fa-pulse'></i>" +
          "</h1>" +
        "</header>" +
        "<div id='site-container'>" +
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
