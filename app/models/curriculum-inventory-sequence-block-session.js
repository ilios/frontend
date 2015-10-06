import DS from 'ember-data';

export default DS.Model.extend({
  countOfferingsOnce: DS.attr('boolean'),
  sequenceBlock: DS.belongsTo('curriculum-inventory-sequence-block', {async: true}),
  session: DS.belongsTo('session', {async: true}),
});
