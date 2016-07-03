import InplaceMixin from '../../../mixins/inplace';
import { module, test } from 'qunit';
import Ember from 'ember';

module('InplaceMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var InplaceObject = Ember.Object.extend(InplaceMixin);
  var subject = InplaceObject.create();
  assert.ok(subject);
});
