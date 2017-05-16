/* eslint-env node */
module.exports = {
  scenarios: [
    {
      name: 'ember-2.12',
      npm: {
        devDependencies: {
          'ember-source': '~2.12',
          'ember-data': '~2.12',
        }
      }
    },
    {
      name: 'ember-release',
      npm: {
        devDependencies: {
          'ember-source': '^2',
          'ember-data': '^2',
        }
      }
    },
    {
      name: 'ember-beta',
      npm: {
        devDependencies: {
          'ember-source': '^2.14.0-beta.1',
          'ember-data': '^2.14.0-beta.1',
        }
      }
    },
    {
      name: 'ember-default',
      npm: {
        devDependencies: {}
      }
    }
  ]
};
