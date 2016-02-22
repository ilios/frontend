import Ember from 'ember';

const { Route } = Ember;

export default Route.extend({
  queryParams: {
    titleFilter: {
      replace: true
    }
  }
});
