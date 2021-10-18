import Model, { belongsTo, attr } from '@ember-data/model';

export default class CurriculumInventorySequence extends Model {
  @attr('string')
  description;

  @belongsTo('curriculum-inventory-report', { async: true })
  report;
}
