/* eslint-env node */
'use strict';

module.exports = function (/* environment, appConfig */) {
  // See https://github.com/san650/ember-web-app#documentation for a list of
  // supported properties

  return {
    name: "Ilios",
    short_name: "Ilios",
    description: "Curriculum management for the health professions",
    start_url: "/dashboard",
    display: "fullscreen",
    background_color: "#eee",
    theme_color: "#c60",
    icons: [
      {
        "src": "assets/icons/ilios-sunburst16.png",
        "sizes": "16x16"
      },
      {
        "src": "assets/icons/ilios-sunburst32.png",
        "sizes": "32x32"
      },
      {
        "src": "assets/icons/ilios-sunburst48.png",
        "sizes": "48x48"
      },
      {
        "src": "assets/icons/ilios-sunburst72.png",
        "sizes": "72x72"
      },
      {
        "src": "assets/icons/ilios-sunburst128.png",
        "sizes": "128x128"
      },
      {
        "src": "assets/icons/ilios-sunburst180.png",
        "sizes": "180x180"
      },
      {
        "src": "assets/icons/ilios-sunburst144.png",
        "sizes": "144x144"
      },
      {
        "src": "assets/icons/ilios-sunburst256.png",
        "sizes": "256x256"
      },
      {
        "src": "assets/icons/ilios-sunburst512.png",
        "sizes": "512x512"
      },
    ],

    ms: {
      tileColor: '#c60'
    }
  };
};
