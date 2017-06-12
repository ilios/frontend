/* eslint-env node */
module.exports = {
  description: 'Add project dependencies',
  normalizeEntityName: function() {
    // allows us to run ember -g ilios-frontend and not blow up
    // because ember cli normally expects the format
    // ember generate <entitiyName> <blueprint>
  },
  afterInstall: function(/* options */) {
    return this.addAddonsToProject({ packages: [
      'ember-cli-neat',
      'ember-font-awesome',
      'ember-moment',
      'ember-normalize',
      'ember-simple-auth',
    ]});
  }
};
