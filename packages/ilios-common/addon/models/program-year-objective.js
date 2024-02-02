import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class ProgramYearObjective extends Model {
  @attr('string')
  title;

  @attr('number', { defaultValue: 0 })
  position;

  @attr('boolean', { defaultValue: true })
  active;

  @belongsTo('competency', { async: true, inverse: 'programYearObjectives' })
  competency;

  @belongsTo('program-year', { async: true, inverse: 'programYearObjectives' })
  programYear;

  @hasMany('term', { async: true, inverse: 'programYearObjectives' })
  terms;

  @cached
  get _termsData() {
    return new TrackedAsyncData(this.terms);
  }

  @hasMany('mesh-descriptor', { async: true, inverse: 'programYearObjectives' })
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

  @cached
  get _allTermVocabulariesData() {
    if (!this._termsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._termsData.value.map((t) => t.vocabulary)));
  }

  get associatedVocabularies() {
    if (!this._allTermVocabulariesData?.isResolved) {
      return [];
    }

    return sortBy(uniqueValues(this._allTermVocabulariesData.value), 'title');
  }

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
