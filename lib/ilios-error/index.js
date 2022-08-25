/* eslint-env node */
/* eslint node/no-extraneous-require: 0 */

'use strict';

const browserslist = require('browserslist');
const caniuse = require('caniuse-db/data.json').agents;

module.exports = {
  name: 'ilios-error',

  contentFor: function (type) {
    const script = this.getScript();
    if (type === 'body') {
      return `
        <script>
          ${script}
        </script>
      `;
    }
  },

  getScript() {
    const supportedBrowsers = this.getSupportedBrowsers().join('');
    return `
      // if there is an uncaught runtime error show the error message
      window.addEventListener('error', function () {
        var loadingIndicator = document.getElementById('ilios-loading-indicator');
        if (loadingIndicator) {
          loadingIndicator.parentNode.removeChild(loadingIndicator);
        }

        if (!document.getElementById('ilios-loading-error')) {
          var link = document.createElement( "link" );
          link.href = 'ilios-error/style.css';
          link.type = "text/css";
          link.rel = "stylesheet";
          link.media = "screen";

          document.getElementsByTagName( "head" )[0].appendChild( link );
          var errorContainer = document.createElement('div');
          errorContainer.id = 'ilios-loading-error';
          errorContainer.setAttribute('role', 'banner');
          errorContainer.innerHTML = '' +
            '<h1>' +
              'It is possible that your browser is not supported by Ilios. ' +
              'Please refresh this page or try a different browser.' +
            '</h1>' +
            '<div class="supported-browsers">' +
              '<h2 id="ilios-loading-error-browsers">Minimum Supported Browsers</h2>' +
              '<ul aria-labelledby="ilios-loading-error-browsers">${supportedBrowsers}</ul>' +
            '</div>';
          document.body.appendChild(errorContainer);
        }
      });
    `;
  },

  getBrowserLogo(id) {
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
  },

  getSupportedBrowsers() {
    const targets = this.project.targets && this.project.targets.browsers;
    const query = targets.join(', ');
    const list = browserslist(query);

    const mappedList = list.map((browser) => {
      const arr = browser.split(' ');
      const id = arr[0];
      const version = arr[1];

      const db = caniuse[id];

      return {
        version: version,
        id: id,
        name: db.browser,
        logo: this.getBrowserLogo(id),
      };
    });

    mappedList.sort((a, b) => a.name.localeCompare(b.name));

    return mappedList.map((obj) => {
      const logo = obj.logo
        ? `<img src="${obj.logo}" alt="${obj.name} logo" aria-hidden="true">`
        : '';
      return `<li>${logo} ${obj.name} ${obj.version}</li>`;
    });
  },
};
