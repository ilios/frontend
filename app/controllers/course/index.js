import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    sortSessionsBy: 'sortBy',
    filterSessionsBy: 'filterBy',
  },
  sortSessionsBy: 'title',
  filterSessionsBy: '',
  canCreateSession: false,
  canUpdateCourse: false,
});
