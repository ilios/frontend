import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['sortBy'],
  sortBy: 'firstOfferingDate',
});
