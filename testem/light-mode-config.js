'use strict';

const base = require('ilios-common/testem/base');
const storeFirefoxPreferences = require('ilios-common/testem/firefox-preferences');

const firefoxUserJsPath = storeFirefoxPreferences([
  ['layout.css.prefers-color-scheme.content-override', 1],
]);

module.exports = {
  ...base,
  firefox_user_js: firefoxUserJsPath,
  launchers: {
    SafariApplescript: {
      protocol: 'browser',
      exe: 'osascript',
      args: [
        '-e',
        `tell application "Safari"
          activate
          open location "<url>"
         end tell
         delay 3000`,
      ],
    },
  },
};
