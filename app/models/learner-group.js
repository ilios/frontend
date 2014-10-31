import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  location: DS.attr('string'),
  cohort: DS.belongsTo('cohort', {async: true}),
  parent: DS.belongsTo('learner-group', {async: true, inverse: 'children'}),
  children: DS.hasMany('learner-group', {async: true, inverse: 'parent'}),
  users: DS.hasMany('user', {async: true}),
  instructors: DS.hasMany('user', {async: true}),
  instructorGroups: DS.hasMany('instructor-group', {async: true}),
  offerings: DS.hasMany('offering', {async: true}),
  courses: [],
  offeringsObserver: function(){
    //fill the courses array from the offerings
  }.observes('offerings')
});
