'use strict';

const writeFile = require('broccoli-file-creator');

const VERSION_FILE = 'VERSION.txt';

module.exports = {
  name: require('./package').name,

  _config: {
    currentVersion: null,
    versionFile: VERSION_FILE,
  },

  config(env, baseConfig) {
    this._config.currentVersion = this.parent.pkg.version;
    baseConfig.newVersion = this._config;
    return baseConfig;
  },

  treeForPublic() {
    return writeFile(this._config.versionFile, this._config.currentVersion);
  },
};
