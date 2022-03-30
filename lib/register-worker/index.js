'use strict';

module.exports = {
  name: require('./package').name,

  isDevelopingAddon() {
    return true;
  },

  contentFor: function (type, config) {
    if (type === 'head' && !config.disableServiceWorker) {
      return `<script src="sw-registration.js"></script>`;
    }
  },
};
