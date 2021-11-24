import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedResolveCP from 'ilios-common/classes/deprecated-resolve-cp';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';

export default class ProgramYearObjective extends Model {
  @attr('string')
  title;

  @attr('number', { defaultValue: 0 })
  position;

  @attr('boolean', { defaultValue: true })
  active;

  @belongsTo('competency', { async: true })
  competency;

  @belongsTo('program-year', { async: true })
  programYear;

  @hasMany('term', { async: true })
  terms;

  @hasMany('mesh-descriptor', { async: true })
  meshDescriptors;

  @belongsTo('program-year-objective', {
    inverse: 'descendants',
    async: true,
  })
  ancestor;

  @hasMany('program-year-objective', {
    inverse: 'ancestor',
    async: true,
  })
  descendants;

  @hasMany('course-objective', {
    inverse: 'programYearObjectives',
    async: true,
  })
  courseObjectives;

  @use _allTermVocabularies = new ResolveFlatMapBy(() => [this.terms, 'vocabulary']);
  get associatedVocabularies() {
    return this._allTermVocabularies?.uniq().sortBy('title');
  }

  @use firstProgram = new DeprecatedResolveCP(() => [
    this.programYear.get('program'),
    'programYearObjective.firstProgram',
  ]);

  @use firstCohort = new DeprecatedResolveCP(() => [
    this.programYear.get('cohort'),
    'programYearObjective.firstCohort',
  ]);

  /**
   * @todo check if this method is obsolete, if so remove it [ST 2020/07/08]
   */
  get shortTitle() {
    const title = this.title;
    if (title === undefined) {
      return '';
    }
    return title.substr(0, 200);
  }
}
