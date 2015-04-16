import Ember from 'ember';
import InplaceMixin from '../../../mixins/inplace';
import { module, test } from 'qunit';

module('InplaceMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var InplaceObject = Ember.Object.extend(InplaceMixin);
  var subject = InplaceObject.create();
  assert.ok(subject);
});
