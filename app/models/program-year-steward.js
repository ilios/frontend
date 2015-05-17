import DS from 'ember-data';

export default DS.Model.extend({
  programYear: DS.belongsTo('program-year', {async: true}),
  school: DS.belongsTo('school', {async: true}),
  department: DS.belongsTo('department', {async: true}),
});
