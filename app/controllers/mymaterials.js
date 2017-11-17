import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['sortBy', 'filter', 'course'],
  sortBy: 'firstOfferingDate:desc',
  filter: null,
  course: "",
});
