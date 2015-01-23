import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  type: DS.attr('string'),
  owner: DS.attr('string'),
  required: DS.attr('boolean'),
  notes: DS.attr('string'),
  courses: DS.hasMany('course', {async: true})
});
