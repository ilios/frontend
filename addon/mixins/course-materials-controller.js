import Mixin from '@ember/object/mixin';

export default Mixin.create({
  queryParams: ['clmSortBy', 'slmSortBy'],

  clmSortBy: 'title',
  slmSortBy: 'firstOfferingDate'
});
