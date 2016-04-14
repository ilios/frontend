import Ember from 'ember';
import ObjectiveListItemMixin from 'ilios/mixins/objective-list-item';
import { module, test } from 'qunit';

module('Unit | Mixin | objective list item');

// Replace this with your real tests.
test('it works', function(assert) {
  let ObjectiveListItemObject = Ember.Object.extend(ObjectiveListItemMixin);
  let subject = ObjectiveListItemObject.create();
  assert.ok(subject);
});
