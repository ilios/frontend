import Service from '@ember/service';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

let currentUserMock;

module('Integration | Component | pending updates summary', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    currentUserMock = Service.extend({});
    this.owner.register('service:currentUser', currentUserMock);
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.create('school');
    const user = this.server.create('user', { school });
    const userModel = await run(() => this.owner.lookup('service:store').find('user', user.id));
    for (let i = 0; i < 5; i++) {
      const user = this.server.create('user', { school });
      this.server.create('pending-user-update', { user });
    }
    this.server.logging = true;

    currentUserMock.reopen({
      model: resolve(userModel)
    });

    const schools = await run(() => this.owner.lookup('service:store').findAll('school'));
    this.set('schools', schools);
    await render(hbs`{{pending-updates-summary schools=schools}}`);

    assert.ok(this.element.textContent.includes('Updates from the Campus Directory'));
    assert.ok(this.element.textContent.includes('There are 5 users needing attention'));
    assert.dom(this.element.querySelector('[data-test-pending-updates-summary]')).hasClass('alert');
  });
});
