import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class CurriculumInventoryReport extends Model {
  @attr('string')
  name;

  @attr('string')
  description;

  @attr('string')
  year;

  @attr('date')
  startDate;

  @attr('date')
  endDate;

  @attr('string')
  absoluteFileUri;

  @belongsTo('curriculum-inventory-export', { async: true, inverse: 'report' })
  export;

  @belongsTo('curriculum-inventory-sequence', { async: true, inverse: 'report' })
  sequence;

  @hasMany('curriculum-inventory-sequence-block', {
    async: true,
    inverse: 'report',
  })
  sequenceBlocks;

  @belongsTo('program', { async: true, inverse: 'curriculumInventoryReports' })
  program;

  @hasMany('curriculum-inventory-academic-level', {
    async: true,
    inverse: 'report',
  })
  academicLevels;

  @hasMany('user', { async: true, inverse: 'administeredCurriculumInventoryReports' })
  administrators;

  async getTopLevelSequenceBlocks() {
    return (await this.sequenceBlocks).filter((block) => {
      return !block.belongsTo('parent').id();
    });
  }

  async getLinkedCourses() {
    const courses = await Promise.all(mapBy((await this.sequenceBlocks).slice(), 'course'));
    return courses.filter(Boolean);
  }
}
