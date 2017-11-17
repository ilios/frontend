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
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#cc6600",
    icons: [
      //favicon icons get a transparent background
      ...[16, 32, 48, 96].map(size => ({
        src: `/assets/icons/sunburst-transparent${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        targets: ['favicon'],
      })),
      {
        src: "/assets/icons/sunburst-white-background192.png",
        sizes: "192x192",
        type: "image/png",
        targets: ['manifest'],
      },
      {
        src: "/assets/icons/sunburst-transparent512.png",
        sizes: "512x512",
        type: "image/png",
        targets: ['manifest'],
      },
      // apple icons end up in index.html as link tags so we should limit them to specific ones
      {
        src: "/assets/icons/sunburst-white-background192.png",
        sizes: "192x192",
        type: "image/png",
        targets: ['apple'],
      },
      // MS requires special icon sizes
      {
        src: "/assets/icons/sunburst-transparent150.png",
        sizes: "150x150",
        type: "image/png",
        element: 'square150x150logo',
        targets: ['ms'],
      },
    ],

    apple: {
      statusBarStyle: 'black',
      precomposed: true,
    },

    ms: {
      tileColor: '#2d89ef'
    }
  };
};
