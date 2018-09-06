import Mixin from '@ember/object/mixin';

export default Mixin.create({
  queryParams: {
    sortSessionsBy: 'sortBy',
    filterSessionsBy: 'filterBy',
  },
  sortSessionsBy: 'title',
  filterSessionsBy: '',
  canCreateSession: false,
  canUpdateCourse: false,
});
