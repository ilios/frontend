import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

export default Model.extend({
  name: attr('string'),
  aamcCode: attr('string'),
  addressStreet: attr('string'),
  addressCity: attr('string'),
  addressStateOrProvince: attr('string'),
  addressZipCode: attr('string'),
  addressCountryCode: attr('string'),
  school: belongsTo('school', {async: true}),
});
