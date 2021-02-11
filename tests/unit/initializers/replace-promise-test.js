import Application from '@ember/application';
import { initialize } from 'ilios/initializers/replace-promise';
import { module, test } from 'qunit';
import Resolver from 'ember-resolver';
import destroyApp from '../../helpers/destroy-app';
import RSVP from 'rsvp';

module('Unit | Initializer | replace promise', function(hooks) {
  hooks.beforeEach(function() {
    this.TestApplication = class TestApplication extends Application {};
    this.TestApplication.initializer({
      name: 'replace promise initializer',
      initialize
    });

    this.application = this.TestApplication.create({ autoboot: false, Resolver });
  });

  hooks.afterEach(function() {
    destroyApp(this.application);
  });

  test('it works', async function(assert) {
    await this.application.boot();
    assert.ok(window.Promise === RSVP.Promise);
  });
});
