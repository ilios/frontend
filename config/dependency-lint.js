/* eslint-env node */
'use strict';

module.exports = {
  allowedVersions: {
    'ember-concurrency': '^0.9.0 || ^0.10.0 || ^1.0.0', //conflict with ember-cli-new-version and ilios-common
    'ember-popper': '^0.9.2 || ^0.10.1', // conflict with ember-popper version in ilios-common
    'ember-maybe-in-element': '^0.1.3 || ^0.2.0' //sub-dependency of ember-popper, see comment on ember-popper
  }
};
