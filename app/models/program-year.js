import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class ProgramYear extends Model {
  @attr('string')
  startYear;

  @attr('boolean')
  locked;

  @attr('boolean')
  archived;

  @belongsTo('program', { async: true, inverse: 'programYears' })
  program;

  @cached
  get _programData() {
    return new TrackedAsyncData(this.program);
  }

  @belongsTo('cohort', { async: true, inverse: 'programYear' })
  cohort;

  @hasMany('user', { async: true, inverse: 'programYears' })
  directors;

  @hasMany('competency', { async: true, inverse: 'programYears' })
  competencies;

  @hasMany('program-year-objective', { async: true, inverse: 'programYear' })
  programYearObjectives;

  @hasMany('term', { async: true, inverse: 'programYears' })
  terms;

  @cached
  get _termsData() {
    return new TrackedAsyncData(this.terms);
  }

  get xObjectives() {
    return this.programYearObjectives;
  }

  @cached
  get _schoolData() {
    if (!this._programData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(this._programData.value.school);
  }

  @cached
  get _schoolVocabulariesData() {
    if (!this._schoolData?.isResolved) {
      return null;
    }

    return new TrackedAsyncData(this._schoolData.value.vocabularies);
  }

  get assignableVocabularies() {
    if (!this._schoolVocabulariesData?.isResolved) {
      return [];
    }

    return sortBy(this._schoolVocabulariesData.value, 'title');
  }

  get classOfYear() {
    if (!this._programData.isResolved) {
      return '';
    }
    const classOfYear = Number(this.startYear) + Number(this._programData.value.duration);
    //return as a string
    return `${classOfYear}`;
  }

  async getClassOfYear() {
    const program = await this.program;
    return Number(this.startYear) + Number(program.duration);
  }

  @cached
  get _termVocabularies() {
    if (!this._termsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._termsData.value.map((t) => t.vocabulary)));
  }

  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    if (!this._termVocabularies?.isResolved) {
      return [];
    }
    return sortBy(uniqueValues(this._termVocabularies.value), 'title');
  }

  /**
   * The number of terms attached to this model
   */
  get termCount() {
    return this.hasMany('terms').ids().length;
  }
}
