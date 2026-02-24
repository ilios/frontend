/* eslint camelcase: 0 */
'use strict';

const FailureOnlyReporter = require('testem-failure-only-reporter');

module.exports = {
  test_page: 'tests/index.html?hidepassed&enableA11yAudit',
  disable_watching: true,
  launch_in_ci: ['Firefox'],
  launch_in_dev: ['Firefox'],
  browser_disconnect_timeout: 300,
  browser_start_timeout: 120,
  parallel: process.env.EMBER_EXAM_SPLIT_COUNT || -1,
  reporter: FailureOnlyReporter,
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900',
      ].filter(Boolean),
    },
    Firefox: {
      ci: ['--headless', '--window-size=1440,900'].filter(Boolean),
    },
  },
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
