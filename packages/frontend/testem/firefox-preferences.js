'use strict';

const path = require('path');
const fs = require('fs');

const buildDir = process.env.BUILD_DIR || path.resolve(__dirname, '../../../build');
const firefoxUserJsPath = path.join(buildDir, 'firefox-user.js');

// Ensure directories exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

module.exports = (preferences) => {
  const prefs = preferences.map(([name, value]) => `user_pref("${name}", ${value});`);

  const userJsContent = `${prefs.join('\n')}`.trim();

  fs.writeFileSync(firefoxUserJsPath, userJsContent);

  return firefoxUserJsPath;
};
