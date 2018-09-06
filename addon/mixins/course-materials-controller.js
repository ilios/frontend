import Mixin from '@ember/object/mixin';

export default Mixin.create({
  queryParams: ['sortBy'],
  sortBy: 'firstOfferingDate',
});
