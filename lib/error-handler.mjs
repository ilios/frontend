import targets from '../config/targets.js';
import browserslist from 'browserslist';
import caniuse from 'caniuse-db/data.json' with { type: 'json' };

/**
 * Create and insert the script and styles for our browser crash error handler.
 * This is specifically responsible for handling cases where the app does not boot in
 * the browser at all due to syntax or parsing limitations in the browser.
 */
export default function iliosErrors() {
  return {
    name: 'ilios-errors',

    transformIndexHtml() {
      return [
        {
          tag: 'script',
          children: getScript(),
          injectTo: 'head',
        },
      ];
    },
  };
}

function getScript() {
  const supportedBrowsers = getSupportedBrowsers().join('');

  return `
      // if there is an uncaught runtime error show the error message
      window.runtimeRenderErrorListener = function (event) {
        console.error(event.message);
        var loadingIndicator = document.getElementById('ilios-loading-indicator');
        if (loadingIndicator) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }

        if (!document.getElementById('ilios-loading-error')) {
          var style = document.createElement("style");
          style.type = "text/css";
          var css = ${getStyle()};

          if (style.styleSheet) {
            style.styleSheet.cssText = css;
          } else {
            style.appendChild(document.createTextNode(css));
          }
          document.getElementsByTagName( "head" )[0].appendChild( style );

          var dialogContainer = document.createElement('dialog');
          dialogContainer.id = 'ilios-loading-error';
          dialogContainer.setAttribute('role', 'banner');

          var errorContainer = document.createElement('div');
          errorContainer.id = 'ilios-loading-error-content';

          errorContainer.innerHTML = '' +
            '<h1>' +
              'It is possible that your browser is not supported by Ilios. ' +
              'Please refresh this page or try a different browser.' +
            '</h1>' +
            '<div class="supported-browsers">' +
              '<h2 id="ilios-loading-error-browsers">Minimum Supported Browsers</h2>' +
              '<ul aria-labelledby="ilios-loading-error-browsers">${supportedBrowsers}</ul>' +
            '</div>' +
            '<fieldset>' +
              '<legend>Error Message</legend>' +
              '<pre>' + event.message + '</pre>' +
              '<pre>' + event.filename + '</pre>' +
              '<pre>' + event.lineno + '</pre>' +
            '</fieldset>'
          ;

          dialogContainer.appendChild(errorContainer);
          document.body.appendChild(dialogContainer);
        }
      }
      window.addEventListener('error', window.runtimeRenderErrorListener);
    `;
}

function getBrowserLogo(id) {
  if (id === 'ios_saf') {
    id = 'safari-ios';
  }
  if (id === 'samsung') {
    id = 'samsung-internet';
  }
  if (id === 'op_mini') {
    id = 'opera-mini';
  }

  const same = [
    'chrome',
    'firefox',
    'edge',
    'safari',
    'safari-ios',
    'samsung-internet',
    'opera-mini',
  ];
  if (same.includes(id)) {
    return `https://cdnjs.cloudflare.com/ajax/libs/browser-logos/44.0.0/${id}/${id}_16x16.png`;
  }

  if (id === 'ie') {
    return `https://cdnjs.cloudflare.com/ajax/libs/browser-logos/44.0.0/archive/internet-explorer_9-11/internet-explorer_9-11_16x16.png`;
  }

  if (id === 'and_chr') {
    return `https://cdnjs.cloudflare.com/ajax/libs/browser-logos/44.0.0/archive/android/android_16x16.png`;
  }

  if (id === 'and_uc') {
    return `https://cdnjs.cloudflare.com/ajax/libs/browser-logos/44.0.0/archive/uc/uc_16x16.png`;
  }
}

function getSupportedBrowsers() {
  const query = targets.browsers.join(', ');
  const list = browserslist(query);

  const mappedList = list.map((browser) => {
    const arr = browser.split(' ');
    const id = arr[0];
    const version = arr[1];

    const db = caniuse.agents[id];

    return {
      version: version,
      id: id,
      name: db.browser,
      logo: getBrowserLogo(id),
    };
  });

  mappedList.sort((a, b) => a.name.localeCompare(b.name));

  return mappedList.map((obj) => {
    const logo = obj.logo
      ? `<img src="${obj.logo}" alt="${obj.name} logo" aria-hidden="true">`
      : '';
    return `<li>${logo} ${obj.name} ${obj.version}</li>`;
  });
}

function getStyle() {
  const style = `
    #ilios-loading-error {
      align-items: center;
      background-color: light-dark(var(--slightly-transparent-black), var(--dark-grey));
      border: none;
      color: light-dark(var(--black), var(--white));
      display: flex;
      height: 100%;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 5;

      #ilios-loading-error-content {
        background-color: light-dark(var(--white), var(--black));
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        max-height: 90vh;
        max-width: 90vw;
        overflow: auto;
        padding: 1em;
        position: sticky;
        z-index: 5;

        h1,
        h2 {
          text-align: center;
        }

        .supported-browsers {
          border: 1px solid light-dark(var(--blue), var(--light-blue));
          margin: 1rem 0;
          padding: 1rem 2rem;
        }

        ul {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-evenly;
          list-style-type: none;
          padding-inline-start: 0;
        }

        fieldset {
          pre {
            max-height: 100%;
            min-height: 0;
            overflow: auto;
            white-space: normal;
          }
        }

        .hidden {
          display: none;
        }
      }
    }
  `;
  return JSON.stringify(style);
}
