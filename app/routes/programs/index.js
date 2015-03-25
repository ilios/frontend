import Ember from 'ember';

export default  Ember.Route.extend({
  currentUser: Ember.inject.service(),
  model: function() {
    return this.get('currentUser.schools');
  }
});
