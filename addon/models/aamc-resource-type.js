import DS from 'ember-data';

const { attr, hasMany, Model } = DS;

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  competencies: hasMany('term', {async: true}),
});
