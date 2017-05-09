import Ember from 'ember';
import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

const inflector = Ember.Inflector.inflector;
inflector.uncountable('aamc-pcrs');

export default Model.extend({
  description: attr('string'),
  competencies: hasMany('competency', {async: true}),
});
