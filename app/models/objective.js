import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  competency: DS.belongsTo('competency'),
  courses: DS.hasMany('course'),
  sessions: DS.hasMany('session'),
  children: DS.hasMany('objective', {
    inverse: 'parents'
  }),
  parents: DS.hasMany('objective', {
    inverse: 'children'
  }),
  programYear: DS.belongsTo('program-year',  {async: true}),
});
