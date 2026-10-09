/**
 * Add the HTML, script, and styles for our loading animation to index.html
 */
export default function loadingAnimation() {
  return {
    name: 'ilios-loading-animation',

    transformIndexHtml(html, context) {
      if (context.path === '/tests/index.html') {
        //don't add the loader when runnign tests.
        return;
      }
      return [
        {
          tag: 'style',
          attrs: {
            type: 'text/css',
          },
          children: getStyles(),
          injectTo: 'head',
        },
        ...getHtmlTags(),
        {
          tag: 'script',
          children: getScript(),
          injectTo: 'body',
        },
      ];
    },
  };
}

function getHtmlTags() {
  return [
    {
      tag: 'div',
      attrs: {
        style: 'visibility: hidden',
        id: 'ilios-loading-indicator',
        'data-deploy': true,
        'aria-live': 'polite',
      },
      injectTo: 'body-prepend',
      children: [
        {
          tag: 'h1',
          attrs: {
            'aria-label': 'Ilios is Loading',
          },
          children: [
            {
              tag: 'svg',
              attrs: {
                xmlns: 'http://www.w3.org/2000/svg',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                viewBox: '0 0 392.11 392.11',
                'aria-hidden': 'true',
              },
              children: [
                {
                  tag: 'title',
                  children: 'Ilios is Loading',
                },
                {
                  tag: 'path',
                  attrs: {
                    d: 'M371.83,461.83c-77.62-89.13-98.6-113.11-30.25-93.76-62.12-34.35-30.23-36.41,87.67-44.87-117.91-8.47-149.8-10.52-87.67-44.87-68.34,19.35-47.37-4.63,30.26-93.76-89.12,77.62-113.11,98.6-93.76,30.25-34.35,62.12-36.41,30.23-44.87-87.68-8.47,117.91-10.53,149.8-44.87,87.68,19.35,68.34-4.64,47.37-93.76-30.26,77.62,89.13,98.59,113.11,30.25,93.76,62.12,34.35,30.23,36.41-87.68,44.87,117.91,8.47,149.8,10.52,87.68,44.87,68.34-19.35,47.37,4.63-30.25,93.76,89.12-77.62,113.11-98.6,93.76-30.25,34.35-62.12,36.41-30.23,44.87,87.68,8.47-117.91,10.52-149.8,44.87-87.68C258.71,363.23,282.7,384.21,371.83,461.83Z',
                    transform: 'translate(-37.14 -127.14)',
                  },
                },
                {
                  tag: 'circle',
                  attrs: {
                    class: 'first-circle',
                    cx: '50%',
                    cy: '50%',
                    r: '25%',
                  },
                },
                {
                  tag: 'circle',
                  attrs: {
                    class: 'second-circle',
                    cx: '50%',
                    cy: '50%',
                    r: '25%',
                  },
                },
                {
                  tag: 'circle',
                  attrs: {
                    class: 'third-circle',
                    cx: '50%',
                    cy: '50%',
                    r: '25%',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

/**
 * Inline the styles for the loader so they don't need to do any network work
 * to get. That makes them appear as soon as the index.html is loaded.
 */
function getStyles() {
  return `
    #ilios-loading-indicator {
      color-scheme: light dark;
      background: light-dark(#eee, hsl(345, 6%, 13%));
      height: 100vh;
      left: 0;
      top: 0;
      position: fixed;
      visibility: hidden;
      width: 100vw;
    }

    #ilios-loading-indicator h1 {
      left: 50%;
      margin: 0;
      padding: 0;
      position: fixed;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    #ilios-loading-indicator svg {
      fill: light-dark(#c60, hsl(30, 100%, 20%));
      height: 50vh;
      overflow: visible;
      stroke: light-dark(#c60, hsl(30, 100%, 20%));
      width: 50vw;
    }

    #ilios-loading-indicator circle {
      animation: pulse-ilios-loading-indicator-circle 3s linear infinite;
      transform: scale(0.5);
      transform-origin: center center;
    }

    #ilios-loading-indicator .first-circle {
      animation-delay: 0.25s;
    }

    #ilios-loading-indicator .second-circle {
      animation-delay: 1.25s;
    }

    #ilios-loading-indicator .third-circle {
      animation-delay: 2.25s;
    }

    @keyframes pulse-ilios-loading-indicator-circle {
      0% {
        transform: scale(0.5);
        opacity: 0;
      }
      50% {
        opacity: 0.1;
      }
      70% {
        opacity: 0.09;
      }
      100% {
        transform: scale(5);
        opacity: 0;
      }
    }
  `;
}
/**
 * Inject a loading script to make the loader visible, we don't want this to cover
 * the noscript, so we need to use javascript to set it up.
 */
function getScript() {
  return `
    function displayIliosLoader() {
      // Show the loader only if javascript is enabled
      var iliosLoadingIndicator = document.getElementById('ilios-loading-indicator');
      if (iliosLoadingIndicator) {
        if (window.localStorage) {
          const theme = window.localStorage.getItem('ilios-theme');
          if (['light', 'dark'].includes(theme)) {
            iliosLoadingIndicator.style.colorScheme = theme;
          }
        }

        iliosLoadingIndicator.style.visibility = 'visible';
      }
    }

    displayIliosLoader();
  `;
}
