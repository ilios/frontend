/* eslint-env node */
/* eslint camelcase: 0 */
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
        src: "assets/icons/ilios-sunburst16.png",
        sizes: "16x16",
        type: "image/png",
        targets: ['manifest', 'favicon', 'ms'],
      },
      {
        src: "assets/icons/ilios-sunburst32.png",
        sizes: "32x32",
        type: "image/png",
        targets: ['manifest', 'favicon', 'ms'],
      },
      {
        src: "assets/icons/ilios-sunburst48.png",
        sizes: "48x48",
        type: "image/png",
        targets: ['manifest', 'favicon', 'ms'],
      },
      {
        src: "assets/icons/ilios-sunburst96.png",
        sizes: "96x96",
        type: "image/png",
        targets: ['manifest', 'favicon', 'ms'],
      },
      {
        src: "assets/icons/ilios-sunburst128.png",
        sizes: "128x128",
        type: "image/png",
        targets: ['manifest', 'ms'],
      },
      {
        src: "assets/icons/ilios-sunburst256.png",
        sizes: "256x256",
        type: "image/png",
        targets: ['manifest', 'ms'],
      },
      {
        src: "assets/icons/ilios-sunburst512.png",
        sizes: "512x512",
        type: "image/png",
        targets: ['manifest', 'ms'],
      },
      // apple requires special icons with a white background
      {
        src: "assets/icons/ilios-sunburst-apple120.png",
        sizes: "120x120",
        type: "image/png",
        targets: ['apple'],
      },
      {
        src: "assets/icons/ilios-sunburst-apple152.png",
        sizes: "152x152",
        type: "image/png",
        targets: ['apple'],
      },
      {
        src: "assets/icons/ilios-sunburst-apple167.png",
        sizes: "167x167",
        type: "image/png",
        targets: ['apple'],
      },
      {
        src: "assets/icons/ilios-sunburst-apple180.png",
        sizes: "180x180",
        type: "image/png",
        targets: ['apple'],
      },
      // MS requires special icon sizes
      {
        src: "assets/icons/ilios-sunburst70.png",
        sizes: "70x70",
        type: "image/png",
        targets: ['ms'],
      },
      {
        src: "assets/icons/ilios-sunburst270.png",
        sizes: "270x270",
        type: "image/png",
        targets: ['ms'],
      },
      {
        src: "assets/icons/ilios-sunburst310.png",
        sizes: "310x310",
        type: "image/png",
        targets: ['ms'],
      },
    ],

    apple: {
      statusBarStyle: 'black',
      precomposed: true,
    },

    ms: {
      tileColor: '#c60'
    }
  };
};
