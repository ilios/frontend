/* eslint-env node */
'use strict';

module.exports = {
  name: 'ilios-error',

  contentFor: function (type, config) {
    if (type === 'head') {
      return `
        <style type="text/css">
          #ilios-loading-error {
            padding: 2em;
            text-align: center;
          }
          #ilios-loading-error table {
            margin: 2rem auto;
          }
          #ilios-loading-error table caption {
            font-weight: bold;
          }
        </style>
      `;
    }
    if (type === 'body-footer') {
      return `<script src="${config.rootURL}ilios-error/scripts.js"></script>`;
    }

    if( type === 'body') {
      return `
        <div id='ilios-loading-error' data-deploy class='hidden ember-load-indicator'>
          <h1>
            It is possible that your browser is not supported by Ilios.
            Please refresh this page or try a different browser.
          </h1>
          <table>
          <caption>Supported Browsers</caption>
          <thead>
            <tr>
              <th>Chrome</th>
              <th>Firefox ESR</th>
              <th>Edge</th>
              <th>Safari</th>
              <th>Android</th>
              <th>Safari iOS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/42.6.0/chrome/chrome_48x48.png" alt="Chrome"></td>
              <td><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/42.6.0/firefox/firefox_48x48.png" alt="Firefox"></td>
              <td><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/42.6.0/edge/edge_48x48.png" alt="Edge"></td>
              <td><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/42.6.0/safari/safari_48x48.png" alt="Safari"></td>
              <td><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/42.6.0/android/android_48x48.png" alt="Android"></td>
              <td><img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/42.6.0/safari-ios/safari-ios_48x48.png" alt="Safari iOS"></td>
            </tr>
            <tr>
              <td>Latest ✔</td>
              <td>Latest ✔</td>
              <td>Latest ✔</td>
              <td>Latest ✔</td>
              <td>Latest ✔</td>
              <td>Latest ✔</td>
            </tr>
          </tbody>
        </table>
        </div>
      `;
    }
  }
};
