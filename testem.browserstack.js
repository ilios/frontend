const FailureOnlyPerBrowserReporter = require('testem-failure-only-reporter/grouped-by-browser');

const BrowserStackLaunchers = {
  BS_OSX_Safari: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'OS X',
      '--osv',
      'Catalina',
      '--b',
      'safari',
      '--bv',
      'latest', // Will always be 13.x on Catalina
      '-t',
      '1800',
      '--browserstack.video',
      'false',
      '--u',
      '<url>',
    ],
    protocol: 'browser',
  },
  BS_MS_Edge: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'Windows',
      '--osv',
      '10',
      '--b',
      'edge',
      '--bv',
      '93',
      '-t',
      '1800',
      '--browserstack.video',
      'false',
      '--u',
      '<url>',
    ],
    protocol: 'browser',
  },
  BS_IOS_SAFARI: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--real_mobile',
      'true',
      '--os',
      'ios',
      '--osv',
      '14',
      '--b',
      'iphone',
      '--device',
      'iPhone 11',
      '-t',
      '1800',
      '--browserstack.video',
      'false',
      '--u',
      '<url>',
    ],
    protocol: 'browser',
  },
};

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  timeout: 1800,
  reporter: FailureOnlyPerBrowserReporter,
  browser_start_timeout: 2000,
  browser_disconnect_timeout: 120,
  parallel: 4,
  disable_watching: true,
  launchers: BrowserStackLaunchers,
  launch_in_dev: [],
  launch_in_ci: Object.keys(BrowserStackLaunchers),
};
