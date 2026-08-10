/* eslint camelcase: 0 */
'use strict';

const base = require('./base');
const createDownloadDirectory = require('./create-download-directory');
const storeFirefoxPreferences = require('./firefox-preferences');

const downloadDir = createDownloadDirectory();

const firefoxUserJsPath = storeFirefoxPreferences([
  ['browser.download.dir', `"${downloadDir}"`],
  ['browser.download.folderList', 2],
  ['browser.download.useDownloadDir', true],
  ['browser.helperApps.neverAsk.saveToDisk', '"image/png"'],
  ['browser.download.manager.showWhenStarting', false],
  ['pdfjs.disabled', true],
  ['ui.prefersReducedMotion', 1],
]);

module.exports = {
  ...base,
  test_page: 'tests/index.html?devmode&takeScreenshots',
  firefox_user_js: firefoxUserJsPath,
};
