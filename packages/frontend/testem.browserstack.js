const FailureOnlyPerBrowserReporter = require('testem-failure-only-reporter/grouped-by-browser');
const defaultArgs = ['-t', '1800', '--browserstack.video', 'false', '--u', '<url>'];

const BrowserStackLaunchers = {
  BS_IOS_SAFARI: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--real_mobile',
      'true',
      '--os',
      'ios',
      '--osv',
      '18',
      '--b',
      'iphone',
      '--device',
      'iPhone 14',
      ...defaultArgs,
    ],
    protocol: 'browser',
  },
  BS_CHROME_ANDROID: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--real_mobile',
      'true',
      '--os',
      'android',
      '--osv',
      '15.0',
      '--b',
      'android',
      '--device',
      'Google Pixel 9',
      ...defaultArgs,
    ],
    protocol: 'browser',
  },
};

module.exports = {
  test_page: 'tests/index.html?hidepassed&hideskipped&timeout=60000&enableA11yAudit',
  timeout: 1800,
  reporter: FailureOnlyPerBrowserReporter,
  browser_start_timeout: 2000,
  browser_disconnect_timeout: 240,
  parallel: 1,
  disable_watching: true,
  launchers: BrowserStackLaunchers,
  launch_in_dev: [],
  launch_in_ci: Object.keys(BrowserStackLaunchers),
};
