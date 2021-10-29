import Application from '@ember/application';
import { initialize } from 'dummy/initializers/custom-inflector-rules';
import { module, test } from 'qunit';
import destroyApp from '../../helpers/destroy-app';
import { singularize, pluralize } from 'ember-inflector';

module('Unit | Initializer | custom-inflector-rules', function (hooks) {
  hooks.beforeEach(function () {
    this.TestApplication = Application.extend();
    this.TestApplication.initializer({
      name: 'initializer under test',
      initialize,
    });

    this.application = this.TestApplication.create({ autoboot: false });
  });

  hooks.afterEach(function () {
    destroyApp(this.application);
  });

  test('it works', async function (assert) {
    await this.application.boot();

    assert.strictEqual(pluralize('aamc-pcrs'), 'aamc-pcrses');
    assert.strictEqual(singularize('aamc-pcrses'), 'aamc-pcrs');
  });
});
