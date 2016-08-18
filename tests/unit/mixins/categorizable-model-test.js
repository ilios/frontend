import CategorizableModelMixin from '../../../mixins/categorizable-model';
import { module, test } from 'qunit';
import Ember from 'ember';

module('Unit | Mixin | categorizable model');

// Replace this with your real tests.
test('it works', function(assert) {
  let M = Ember.Object.extend(CategorizableModelMixin);
  let subject = M.create();
  assert.ok(subject);
});
