import Ember from 'ember';
import CurrentUser from '../mixins/current-user';

export default  Ember.Route.extend(CurrentUser, {
  model: function() {
    //@todo the current school obviously shouldn't be a constant
    return this.store.find('school', 0);
  }
});
