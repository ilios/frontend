import EmberObject from '@ember/object';
import LiveSearchItemMixin from 'frontend/mixins/live-search-item';
import { module, test } from 'qunit';

module('LiveSearchItemMixin', function () {
  // Replace this with your real tests.
  test('it works', function (assert) {
    var LiveSearchItemObject = EmberObject.extend(LiveSearchItemMixin);
    var subject = LiveSearchItemObject.create();
    assert.ok(subject);
  });
});
