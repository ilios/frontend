import Application from '@ember/application';
import config from 'test-app/config/environment';
import { initialize } from 'test-app/initializers/custom-inflector-rules';
import { module, test } from 'qunit';
import Resolver from 'ember-resolver';
import { run } from '@ember/runloop';
import { singularize, pluralize } from 'ember-inflector';

module('Unit | Initializer | custom-inflector-rules', function (hooks) {
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

    this.application = this.TestApplication.create({
      autoboot: false,
    });
  });

  hooks.afterEach(function () {
    // eslint-disable-next-line ember/no-runloop
    run(this.application, 'destroy');
  });

  test('it works', async function (assert) {
    await this.application.boot();

    assert.strictEqual(pluralize('aamc-pcrs'), 'aamc-pcrses');
    assert.strictEqual(singularize('aamc-pcrses'), 'aamc-pcrs');
  });
});
