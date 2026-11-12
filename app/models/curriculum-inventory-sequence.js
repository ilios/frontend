import Model, { attr,belongsTo } from '@ember-data/model';

export default class CurriculumInventorySequence extends Model {
  @attr('string')
  description;

  @belongsTo('curriculum-inventory-report', { async: true, inverse: 'sequence' })
  report;
}
