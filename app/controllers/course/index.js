import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: {
    sessionOffset: 'offset',
    sessionLimit: 'limit',
    sortSessionsBy: 'sortBy',
    filterSessionsBy: 'filterBy',
  },
  sessionOffset: 0,
  sessionLimit: 25,
  sortSessionsBy: 'title',
  filterSessionsBy: '',
});
