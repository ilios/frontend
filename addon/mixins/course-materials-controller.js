import Mixin from '@ember/object/mixin';

export default Mixin.create({
  queryParams: ['courseSort', 'sessionSort'],

  courseSort: 'title',
  sessionSort: 'firstOfferingDate'
});
