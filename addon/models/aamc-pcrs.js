import DS from 'ember-data';
import Inflector from 'ember-inflector';

const { Model, attr, hasMany } = DS;

Inflector.inflector.uncountable('aamc-pcrs');

export default Model.extend({
  description: attr('string'),
  competencies: hasMany('competency', {async: true}),
});
