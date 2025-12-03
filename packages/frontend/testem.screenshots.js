/* eslint camelcase: 0 */
'use strict';

const path = require('path');
const fs = require('fs');

const buildDir = process.env.BUILD_DIR || path.resolve(__dirname, '../../build');
const downloadDir = `${buildDir}/screenshots`;
const firefoxUserJsPath = path.join(buildDir, 'firefox-user.js');

// Ensure directories exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// Create Firefox user.js file with download preferences
const userJsContent = `
user_pref("browser.download.dir", "${downloadDir}");
user_pref("browser.download.folderList", 2);
user_pref("browser.download.useDownloadDir", true);
user_pref("browser.helperApps.neverAsk.saveToDisk", "image/png");
user_pref("browser.download.manager.showWhenStarting", false);
user_pref("pdfjs.disabled", true);
`.trim();

fs.writeFileSync(firefoxUserJsPath, userJsContent);

module.exports = {
  test_page: 'tests/index.html?devmode&takeScreenshots',
  disable_watching: true,
  launch_in_ci: ['Firefox'],
  launch_in_dev: ['Firefox'],
  browser_disconnect_timeout: 300,
  browser_start_timeout: 120,
  parallel: process.env.EMBER_EXAM_SPLIT_COUNT || -1,
  browser_args: {
    Firefox: ['--headless'],
  },
  firefox_user_js: firefoxUserJsPath,
};
