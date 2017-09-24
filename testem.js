/* eslint-env node */
/* eslint camelcase: 0 */

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  parallel: 5,
  launch_in_ci: [
    'Chrome'
  ],
  launch_in_dev: [
    'Chrome'
  ],
  browser_args: {
    Chrome: [
      '--disable-gpu',
      '--headless',
      '--remote-debugging-port=9222',
      '--window-size=1440,900'
    ]
  }
};
