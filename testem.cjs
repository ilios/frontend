'use strict';

if (typeof module !== 'undefined') {
  const base = require('./testem/base.cjs');

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
}
