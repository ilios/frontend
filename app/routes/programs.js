import Ember from 'ember';

export default  Ember.Route.extend({
  model: function() {
    //@todo the current school obviously shouldn't be a constant
    return this.store.find('school', 0);
  }
});
