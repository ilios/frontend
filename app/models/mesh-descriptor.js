import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  //alias name to title since that is the standard for nearly every other model
  title: Ember.computed.alias("name"),
  name: DS.attr('string'),
  objectives: DS.hasMany('objectives',  {async: true}),
  courses: DS.hasMany('course',  {async: true}),
});
