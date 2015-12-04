import LiveSearchItemMixin from 'ilios/mixins/live-search-item';
import { module, test } from 'qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

module('LiveSearchItemMixin' + testgroup);

// Replace this with your real tests.
test('it works', function(assert) {
  var LiveSearchItemObject = Ember.Object.extend(LiveSearchItemMixin);
  var subject = LiveSearchItemObject.create();
  assert.ok(subject);
});
