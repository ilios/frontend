import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  countOfferingsOnce: attr('boolean'),
  sequenceBlock: belongsTo('curriculum-inventory-sequence-block', {async: true}),
  session: belongsTo('session', {async: true}),
});
