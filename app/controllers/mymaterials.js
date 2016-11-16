import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  queryParams: ['sortBy', 'filter', 'course'],
  sortBy: 'firstOfferingDate:desc',
  filter: null,
  course: null,
});
