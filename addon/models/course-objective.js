import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
const { alias } = computed;

export default Model.extend({
  course: belongsTo('course', { async: true }),
  objective: belongsTo('objective', { async: true }),
  position: attr('number', { defaultValue: 0 }),
  terms: hasMany('term', { async: true }),
  treeCompetencies: alias('objective.treeCompetencies'),
});
