import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { mapBy, sortBy, uniqueById } from '../utils/array-helpers';

export default class ProgramYear extends Model {
  @attr('string')
  startYear;

  @attr('boolean')
  locked;

  @attr('boolean')
  archived;

  @belongsTo('program', { async: true })
  program;

  @belongsTo('cohort', { async: true })
  cohort;

  @hasMany('user', { async: true })
  directors;

  @hasMany('competency', { async: true })
  competencies;

  @hasMany('program-year-objective', { async: true })
  programYearObjectives;

  @hasMany('term', { async: true })
  terms;

  get xObjectives() {
    return this.programYearObjectives;
  }

  @use _program = new ResolveAsyncValue(() => [this.program]);
  @use _school = new ResolveAsyncValue(() => [this._program?.school]);
  @use _schoolVocabularies = new ResolveAsyncValue(() => [this._school?.vocabularies]);

  get assignableVocabularies() {
    return sortBy(this._schoolVocabularies, 'title');
  }

  get classOfYear() {
    if (!this._program) {
      return '';
    }
    const classOfYear = Number(this.startYear) + Number(this._program.duration);
    //return as a string
    return `${classOfYear}`;
  }

  async getClassOfYear() {
    const program = await this.program;
    return Number(this.startYear) + Number(program.duration);
  }

  @use _programYearObjectives = new ResolveAsyncValue(() => [this.programYearObjectives]);

  /**
   * A list of program-year objectives, sorted by position.
   */
  get sortedProgramYearObjectives() {
    return this._programYearObjectives?.slice().sort(sortableByPosition);
  }

  @use _allTermVocabularies = new ResolveAsyncValue(() => [mapBy(this.terms, 'vocabulary')]);

  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    return sortBy(uniqueById(this._allTermVocabularies), 'title');
  }

  /**
   * The number of terms attached to this model
   */
  get termCount() {
    return this.hasMany('terms').ids().length;
  }
}
