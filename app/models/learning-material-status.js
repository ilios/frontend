import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  learningMaterials: DS.hasMany('learning-material', {async: true}),
});
