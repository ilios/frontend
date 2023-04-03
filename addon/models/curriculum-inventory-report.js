import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { deprecate } from '@ember/debug';
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

  @belongsTo('curriculum-inventory-export', { async: true })
  export;

  @belongsTo('curriculum-inventory-sequence', { async: true })
  sequence;

  @hasMany('curriculum-inventory-sequence-block', { async: true })
  sequenceBlocks;

  @belongsTo('program', { async: true })
  program;

  @hasMany('curriculum-inventory-academic-level', { async: true })
  academicLevels;

  @hasMany('user', { async: true, inverse: 'administeredCurriculumInventoryReports' })
  administrators;

  get isFinalized() {
    deprecate(
      `curriculumInventoryReport.isFinalized called, check export attribute directly instead.`,
      false,
      {
        id: 'common.curriculum-inventory-report-is-finalized',
        for: 'ilios-common',
        until: '62',
        since: '61.1.0',
      }
    );
    return !!this.belongsTo('export').id();
  }

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
