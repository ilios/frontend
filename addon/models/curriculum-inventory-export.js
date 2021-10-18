import Model, { belongsTo, attr } from '@ember-data/model';

export default class CurriculumInventoryExport extends Model {
  @attr('date')
  createdAt;

  @belongsTo('curriculum-inventory-report', { async: true })
  report;

  @belongsTo('user', { async: true })
  createdBy;
}
