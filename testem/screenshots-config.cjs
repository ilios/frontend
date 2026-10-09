/* eslint camelcase: 0 */
'use strict';

const base = require('./base.cjs');
const createDownloadDirectory = require('./create-download-directory.cjs');
const storeFirefoxPreferences = require('./firefox-preferences.cjs');

const downloadDir = createDownloadDirectory();

const firefoxUserJsPath = storeFirefoxPreferences([
  ['browser.download.dir', `"${downloadDir}"`],
  ['browser.download.folderList', 2],
  ['browser.download.useDownloadDir', true],
  ['browser.helperApps.neverAsk.saveToDisk', '"image/png"'],
  ['browser.download.manager.showWhenStarting', false],
  ['pdfjs.disabled', true],
  ['ui.prefersReducedMotion', 1],
  ['layout.css.prefers-color-scheme.content-override', 1],
]);

module.exports = {
  ...base,
  test_page: 'tests/index.html?devmode&takeScreenshots',
  firefox_user_js: firefoxUserJsPath,
};
