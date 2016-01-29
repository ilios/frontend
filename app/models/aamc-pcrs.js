import DS from 'ember-data';

export default DS.Model.extend({
  description: DS.attr('string'),
  competencies: DS.hasMany('competency', {async: true}),
});
