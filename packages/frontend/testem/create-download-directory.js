/* eslint camelcase: 0 */
'use strict';

const path = require('path');
const fs = require('fs');

const buildDir = process.env.BUILD_DIR || path.resolve(__dirname, '../../../build');
const downloadDir = `${buildDir}/screenshots`;

module.exports = () => {
  // Ensure directories exist
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  // Reset downloads directory
  if (fs.existsSync(downloadDir)) {
    fs.rmdirSync(downloadDir);
  }
  fs.mkdirSync(downloadDir, { recursive: true });

  return downloadDir;
};
