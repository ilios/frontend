import DS from 'ember-data';

export default DS.Model.extend({
  department: DS.belongsTo('department', {async: true}),
  programYear: DS.belongsTo('program-year', {async: true}),
  school: DS.belongsTo('school', {async: true}),
});
