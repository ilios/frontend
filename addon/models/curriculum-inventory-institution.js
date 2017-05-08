import DS from 'ember-data';
export default DS.Model.extend({
  name: DS.attr('string'),
  aamcCode: DS.attr('string'),
  addressStreet: DS.attr('string'),
  addressCity: DS.attr('string'),
  addressStateOrProvince: DS.attr('string'),
  addressZipCode: DS.attr('string'),
  addressCountryCode: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
});
