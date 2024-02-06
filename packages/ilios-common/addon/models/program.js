import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

export default class Program extends Model {
  @attr('string')
  title;
  @attr('string')
  shortTitle;
  @attr('number', { defaultValue: 1 })
  duration;
  @belongsTo('school', { async: true, inverse: 'programs' })
  school;
  @hasMany('program-year', { async: true, inverse: 'program' })
  programYears;

  @cached
  get _programYearsData() {
    return new TrackedAsyncData(this.programYears);
  }

  @hasMany('user', { async: true, inverse: 'directedPrograms' })
  directors;
  @hasMany('curriculum-inventory-report', { async: true, inverse: 'program' })
  curriculumInventoryReports;

  get hasCurriculumInventoryReports() {
    return !!this.hasMany('curriculumInventoryReports').ids().length;
  }

  get hasProgramYears() {
    return !!this.hasMany('programYears').ids().length;
  }

  @cached
  get _cohortsData() {
    if (!this._programYearsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(Promise.all(this._programYearsData.value.map((py) => py.cohort)));
  }

  /**
   * All cohorts associated with this program via its program years.
   */
  get cohorts() {
    if (!this._cohortsData?.isResolved) {
      return [];
    }
    return this._cohortsData.value;
  }

  @cached
  get _coursesData() {
    if (!this._cohortsData?.isResolved) {
      return null;
    }
    return new TrackedAsyncData(Promise.all(this._cohortsData.value.map((c) => c.courses)));
  }

  /**
   * All courses linked to this program via its program years/cohorts.
   */
  get courses() {
    if (!this._coursesData?.isResolved) {
      return [];
    }
    return uniqueValues(this._coursesData.value.flat());
  }
}
