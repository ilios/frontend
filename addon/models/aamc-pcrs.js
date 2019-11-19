import Model, { hasMany, attr } from '@ember-data/model';
import Inflector from 'ember-inflector';

Inflector.inflector.uncountable('aamc-pcrs');

export default Model.extend({
  description: attr('string'),
  competencies: hasMany('competency', {async: true}),
});
