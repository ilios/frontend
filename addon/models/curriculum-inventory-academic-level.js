import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class CurriculumInventoryAcademicLevel extends Model {
  @attr('string')
  name;

  @attr('string')
  description;

  @attr('number')
  level;

  @belongsTo('curriculum-inventory-report', { async: true })
  report;

  @hasMany('curriculum-inventory-sequence-block', {
    async: true,
    inverse: 'startingAcademicLevel',
  })
  startingSequenceBlocks;

  @hasMany('curriculum-inventory-sequence-block', {
    async: true,
    inverse: 'endingAcademicLevel',
  })
  endingSequenceBlocks;
}
