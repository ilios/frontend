import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['course', 'filter', 'sortBy'],

  course: '',
  filter: '',
  sortBy: 'firstOfferingDate:desc'
});
