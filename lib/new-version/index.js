'use strict';

const writeFile = require('broccoli-file-creator');

const VERSION_FILE = 'VERSION.txt';

module.exports = {
  name: require('./package').name,

  treeForPublic() {
    return writeFile(VERSION_FILE, this.parent.pkg.version);
  },
};
