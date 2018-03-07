import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import DS from 'ember-data';

const { PromiseArray } = DS;

module('Integration | Component | pending single user update', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });"

    let updates = [
      {
        type: 'emailMismatch',
        value: 'directory-email',
      }
    ];
    let user = EmberObject.create({
      pendingUserUpdates: PromiseArray.create({
        promise: resolve(updates)
      }),
      email: 'user-email'
    });
    updates[0].user = user;

    this.set('user', user);
    await render(hbs`{{pending-single-user-update user=user}}`);

    return settled().then(() => {
      assert.equal(find('*').textContent.trim().search(/The email address in the directory \(directory-email\) does not match the email in ilios \(user-email\)/), 0);
    });
  });
});
