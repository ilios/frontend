'use strict';

const base = require('ilios-common/testem/base');

module.exports = {
  ...base,
  test_page: 'tests/index.html?hidepassed',
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
