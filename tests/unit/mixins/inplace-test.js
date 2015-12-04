import InplaceMixin from '../../../mixins/inplace';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

module('InplaceMixin' + testgroup);

// Replace this with your real tests.
test('it works', function(assert) {
  var InplaceObject = Ember.Object.extend(InplaceMixin);
  var subject = InplaceObject.create();
  assert.ok(subject);
});
