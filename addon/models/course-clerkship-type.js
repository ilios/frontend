import DS from 'ember-data';

const { attr, hasMany, Model } = DS;

export default Model.extend({
  title: attr('string'),
  courses: hasMany('course', {async: true}),
});
