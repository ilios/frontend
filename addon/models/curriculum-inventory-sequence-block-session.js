import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  countOfferingsOnce: attr('boolean'),
  sequenceBlock: belongsTo('curriculum-inventory-sequence-block', {async: true}),
  session: belongsTo('session', {async: true}),
});
