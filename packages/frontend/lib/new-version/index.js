'use strict';

const writeFile = require('broccoli-file-creator');

const versionFileName = 'VERSION.txt';

module.exports = {
  name: require('./package').name,

  treeForPublic() {
    const currentVersion = this.parent.pkg.version;
    return writeFile(versionFileName, currentVersion);
  },
};
