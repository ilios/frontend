import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  description: DS.attr('string'),
  competencies: DS.hasMany('term', {async: true}),
});
