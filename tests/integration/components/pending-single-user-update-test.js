import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import DS from 'ember-data';
import wait from 'ember-test-helpers/wait';

const { resolve } = Ember.RSVP;
const { PromiseArray } = DS;

moduleForComponent('pending-single-user-update', 'Integration | Component | pending single user update', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });"

  let updates = [
    {
      type: 'emailMismatch',
      value: 'directory-email',
    }
  ];
  let user = Ember.Object.create({
    pendingUserUpdates: PromiseArray.create({
      promise: resolve(updates)
    }),
    email: 'user-email'
  });
  updates[0].user = user;

  this.set('user', user);
  this.render(hbs`{{pending-single-user-update user=user}}`);

  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/The email address in the directory \(directory-email\) does not match the email in ilios \(user-email\)/), 0);
  });
});
