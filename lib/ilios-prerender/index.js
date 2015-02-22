module.exports = {
  name: 'ilios-prerender',
  contentFor: function(type, config) {
    if (type === 'body-footer') {
      return "<script type='text/javascript'>" +
          "setTimeout(function(){" +
            "$('#browsererrormessage').removeClass('hidden');" +
            "$('#initialpageloader .waveloader').remove();" +
          "}, 10000);" +
      "</script>";
    }
    //in tests remove this immediatly
    if (type === 'test-body-footer') {
      return "<script type='text/javascript'>" +
          "$('#initialpageloader').remove();" +
      "</script>";
    }



    if( type === 'body') {
      return "<div id='initialpageloader'>" +
        "<header class='main'>" +
          "<span class='logo'>" +
            "<img src='images/ilios-logo.png' alt='Ilios Logo' title='Ilios Logo' />" +
          "</span>" +
        "</header>" +
        "<div class='content'>" +
          "<div class='waveloader is-full-screen is-full-size'>" +
            "<div class='wrapper'>" +
              "<div class='text'>Loading Ilios ...</div>" +
              "<div class='widget'>" +
                "<span></span>" +
                "<span></span>" +
                "<span></span>" +
                "<span></span>" +
                "<span></span>" +
                "<span></span>" +
                "<span></span>" +
                "<span></span>" +
              "</div>" +
            "</div>" +
          "</div>" +
          "<p id='browsererrormessage' class='hidden'>" +
            "It is possible that your browser is not supported by Ilios." +
            "Please refresh this page or try a different browser." +
          "</p>" +
          "</div>" +
        "</div>" +
      "</div>";
    }
  }
};
