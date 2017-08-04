import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: {
    sortSessionsBy: 'sortBy',
    filterSessionsBy: 'filterBy',
  },
  sortSessionsBy: 'title',
  filterSessionsBy: '',
});
