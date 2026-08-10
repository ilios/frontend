/* eslint camelcase: 0 */
'use strict';

const base = require('./testem/base');

module.exports = {
  ...base,
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
