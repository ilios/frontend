import Application from '@ember/application';
import { initialize } from 'ilios/initializers/inflector';
import { module, test } from 'qunit';
import Resolver from 'ember-resolver';
import destroyApp from '../../helpers/destroy-app';
import { pluralize } from 'ember-inflector';

module('Unit | Initializer | inflector', function (hooks) {
  hooks.beforeEach(function () {
    this.TestApplication = class TestApplication extends Application {};
    this.TestApplication.initializer({
      name: 'inflector initializer',
      initialize,
    });
    this.application = this.TestApplication.create({ autoboot: false, Resolver });
  });

  hooks.afterEach(function () {
    destroyApp(this.application);
  });

  test('it works', async function (assert) {
    await this.application.boot();
    assert.strictEqual(pluralize(2, 'vocabulary'), '2 vocabularies');
    assert.strictEqual(pluralize(2, 'aamc-pcrs'), '2 aamc-pcrs');
  });
});
