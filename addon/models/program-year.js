import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

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
    return this._schoolVocabularies?.sortBy('title');
  }

  get classOfYear() {
    if (!this._program) {
      return undefined;
    }
    return Number(this.startYear) + Number(this._program.duration);
  }

  @use _programYearObjectives = new ResolveAsyncValue(() => [this.programYearObjectives]);

  /**
   * A list of program-year objectives, sorted by position.
   */
  get sortedProgramYearObjectives() {
    return this._programYearObjectives?.toArray().sort(sortableByPosition);
  }

  @use _allTermVocabularies = new ResolveAsyncValue(() => [this.terms.mapBy('vocabulary')]);

  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    return this._allTermVocabularies?.uniq().sortBy('title');
  }

  @use _allTermParents = new ResolveAsyncValue(() => [this.terms.mapBy('allParents')]);
  @use _terms = new ResolveAsyncValue(() => [this.terms]);

  /**
   * A list containing all associated terms and their parent terms.
   */
  get termsWithAllParents() {
    if (!this._allTermParents || !this._terms) {
      return undefined;
    }
    return [...this._allTermParents.flat(), ...this._terms.toArray()].uniq();
  }

  /**
   * The number of terms attached to this model
   */
  get termCount() {
    return this.terms.length;
  }
}
