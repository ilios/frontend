import Ember from 'ember';
import LiveSearchItemMixin from 'ilios/mixins/live-search-item';

module('LiveSearchItemMixin');

// Replace this with your real tests.
test('it works', function() {
  var LiveSearchItemObject = Ember.Object.extend(LiveSearchItemMixin);
  var subject = LiveSearchItemObject.create();
  ok(subject);
});
