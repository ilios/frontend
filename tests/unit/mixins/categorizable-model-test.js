import Ember from 'ember';
import CategorizableModelMixin from 'ilios-common/mixins/categorizable-model';
import { module, test } from 'qunit';

module('Unit | Mixin | categorizable model');

// Replace this with your real tests.
test('it works', function(assert) {
  let CategorizableModelObject = Ember.Object.extend(CategorizableModelMixin);
  let subject = CategorizableModelObject.create();
  assert.ok(subject);
});
