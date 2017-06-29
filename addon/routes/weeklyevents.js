import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    expanded: {
      replace: true
    }
  }
});
