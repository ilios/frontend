const defaultArgs = ['-t', '1800', '--browserstack.video', 'false', '--u', '<url>'];

const BrowserStackLaunchers = {
  BS_OSX_Safari: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: [
      '--os',
      'OS X',
      '--osv',
      'Monterey',
      '--b',
      'safari',
      '--bv',
      'latest', // Will always be 15.x on Monterey
      ...defaultArgs,
    ],
    protocol: 'browser',
  },
  BS_MS_Edge: {
    exe: 'node_modules/.bin/browserstack-launch',
    args: ['--os', 'Windows', '--osv', '11', '--b', 'edge', '--bv', '115', ...defaultArgs],
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
      '16',
      '--b',
      'iphone',
      '--device',
      'iPhone 14 Pro',
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
      '13.0',
      '--b',
      'android',
      '--device',
      'Google Pixel 7',
      ...defaultArgs,
    ],
    protocol: 'browser',
  },
};

module.exports = {
  test_page: 'tests/index.html?hidepassed&hideskipped&timeout=60000',
  timeout: 1800,
  browser_start_timeout: 2000,
  browser_disconnect_timeout: 240,
  parallel: 1,
  disable_watching: true,
  launchers: BrowserStackLaunchers,
  launch_in_dev: [],
  launch_in_ci: Object.keys(BrowserStackLaunchers),
};
