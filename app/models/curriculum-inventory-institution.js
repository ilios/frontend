import DS from 'ember-data';
export default DS.Model.extend({
  name: DS.attr('string'),
  aamcCode: DS.attr('string'),
  streetAddress: DS.attr('string'),
  city: DS.attr('string'),
  state: DS.attr('string'),
  zipCode: DS.attr('string'),
  countryCode: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
});
