import Model, { belongsTo, attr } from '@ember-data/model';

export default class CurriculumInventoryExport extends Model {
  @attr('date')
  createdAt;

  @belongsTo('curriculum-inventory-report', { async: true, inverse: 'export' })
  report;

  @belongsTo('user', { async: true, inverse: null })
  createdBy;
}
