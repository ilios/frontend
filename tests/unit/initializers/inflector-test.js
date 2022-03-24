import Application from '@ember/application';
import config from 'ilios/config/environment';
import { initialize } from 'ilios/initializers/inflector';
import { module, test } from 'qunit';
import Resolver from 'ember-resolver';
import { pluralize } from 'ember-inflector';
import { run } from '@ember/runloop';

module('Unit | Initializer | inflector', function (hooks) {
  hooks.beforeEach(function () {
    this.TestApplication = class TestApplication extends Application {
      modulePrefix = config.modulePrefix;
      podModulePrefix = config.podModulePrefix;
      Resolver = Resolver;
    };
    this.TestApplication.initializer({
      name: 'initializer under test',
      initialize,
    });

    this.application = this.TestApplication.create({ autoboot: false });
  });

  hooks.afterEach(function () {
    run(this.application, 'destroy');
  });

  test('it works', async function (assert) {
    await this.application.boot();
    assert.strictEqual(pluralize(2, 'vocabulary'), '2 vocabularies');
    assert.strictEqual(pluralize(2, 'aamc-pcrs'), '2 aamc-pcrs');
  });
});
