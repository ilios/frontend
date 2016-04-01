import Ember from 'ember';
import NewuserMixin from 'ilios/mixins/newuser';
import { module, test } from 'qunit';

module('Unit | Mixin | newuser');

// Replace this with your real tests.
test('it works', function(assert) {
  let NewuserObject = Ember.Object.extend(NewuserMixin);
  let subject = NewuserObject.create();
  assert.ok(subject);
});
