/* eslint-env node */
'use strict';

const browserslist = require('browserslist');
const caniuse = require('caniuse-db/data.json').agents;

module.exports = {
  name: 'ilios-error',

  contentFor: function (type, config) {
    if (type === 'head') {
      return `
        <style type="text/css">
          #ilios-loading-error {
            padding: 2em;
          }
          #ilios-loading-error h1,
          #ilios-loading-error h2 {
            text-align: center;
          }
          #ilios-loading-error .supported-browsers {
            border: 1px solid blue;
            margin-top: 1rem;
            padding: 1rem 2rem;
          }
          #ilios-loading-error ul {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            list-style-type: none;
          }
          #ilios-loading-error.hidden {
            display: none;
          }
        </style>
      `;
    }
    if (type === 'body-footer') {
      return `<script src="${config.rootURL}ilios-error/scripts.js"></script>`;
    }

    if (type === 'body') {
      const supportedBrowsers = this.getSupportedBrowsers().join('');
      return `
        <div id='ilios-loading-error' data-deploy class='hidden ember-load-indicator'>
          <h1>
            It is possible that your browser is not supported by Ilios.
            Please refresh this page or try a different browser.
          </h1>
          <div class='supported-browsers'>
            <h2 id='ilios-loading-error-browsers'>Supported Browsers</h2>
            <ul aria-labelledby='ilios-loading-error-browsers'>${supportedBrowsers}</ul>
          </div>
        </div>
      `;
    }

    if (type === 'test-body-footer') {
      return `<script type='application/javascript'>
        var errorContainer = document.getElementById('ilios-loading-error');
        if (errorContainer) {
          errorContainer.parentNode.removeChild(errorContainer);
        }
      </script>`;
    }
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

    const same = ['chrome', 'firefox', 'edge', 'safari', 'safari-ios', 'samsung-internet', 'opera-mini'];
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

    const mappedList = list.map(browser => {
      const arr = browser.split(' ');
      const id = arr[0];
      const version = arr[1];

      const db = caniuse[id];

      return {
        "version": version,
        "id": id,
        "name": db.browser,
        "logo": this.getBrowserLogo(id)
      };
    });

    mappedList.sort((a, b) => a.name.localeCompare(b.name));

    return mappedList.map(obj => {
      let logo = obj.logo ? `<img src="${obj.logo}" alt="${obj.name} logo" aria-hidden='true'>` : '';
      return `<li>${logo} ${obj.name} ${obj.version}</li>`;
    });
  }
};
