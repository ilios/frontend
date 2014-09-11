import Ember from 'ember';
import CurrentUserMixin from 'ilios/mixins/current-user';

module('CurrentUserMixin');

// Replace this with your real tests.
test('it works', function() {
  var CurrentUserObject = Ember.Object.extend(CurrentUserMixin);
  var subject = CurrentUserObject.create();
  ok(subject);
});
