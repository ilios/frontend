import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';
import { deprecate } from '@ember/debug';

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

  @use topLevelSequenceBlocks = new DeprecatedAsyncCP(() => [
    this.getTopLevelSequenceBlocks.bind(this),
    'curriculumInventoryReport.topLevelSequenceBlocks',
    this.sequenceBlocks,
  ]);

  @use linkedCourses = new DeprecatedAsyncCP(() => [
    this.getLinkedCourses.bind(this),
    'curriculumInventoryReport.linkedCourses',
    this.sequenceBlocks,
  ]);

  @use hasLinkedCourses = new DeprecatedAsyncCP(() => [
    this._hasLinkedCourses.bind(this),
    'curriculumInventoryReport._hasLinkedCourses',
    this.sequenceBlocks,
  ]);

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
    const courses = await Promise.all((await this.sequenceBlocks).toArray().mapBy('course'));
    return courses.filter(Boolean);
  }

  /**
   * @deprecated
   */
  async _hasLinkedCourses() {
    const linkedCourses = await this.getLinkedCourses();
    return !!linkedCourses.length;
  }
}
