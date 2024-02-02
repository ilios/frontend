import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class SessionObjectiveModel extends Model {
  @attr('string')
  title;

  @attr('number', { defaultValue: 0 })
  position;

  @attr('boolean', { defaultValue: true })
  active;

  @belongsTo('session', { async: true, inverse: 'sessionObjectives' })
  session;

  @hasMany('term', { async: true, inverse: 'sessionObjectives' })
  terms;

  @cached
  get _termsData() {
    return new TrackedAsyncData(this.terms);
  }

  @hasMany('mesh-descriptor', { async: true, inverse: 'sessionObjectives' })
  meshDescriptors;

  @belongsTo('session-objective', {
    inverse: 'descendants',
    async: true,
  })
  ancestor;

  @hasMany('session-objective', {
    inverse: 'ancestor',
    async: true,
  })
  descendants;

  @hasMany('course-objective', {
    inverse: 'sessionObjectives',
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
    return this.title?.substr(0, 200) ?? '';
  }
}
