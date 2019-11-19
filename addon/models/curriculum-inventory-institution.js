import Model, { belongsTo, attr } from '@ember-data/model';

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
