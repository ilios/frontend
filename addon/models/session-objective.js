import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';
import { sortByString, uniqueById } from '../utils/array-helpers';

export default class SessionObjectiveModel extends Model {
  @attr('string')
  title;

  @attr('number', { defaultValue: 0 })
  position;

  @attr('boolean', { defaultValue: true })
  active;

  @belongsTo('session', { async: true })
  session;

  @hasMany('term', { async: true })
  terms;

  @hasMany('mesh-descriptor', { async: true })
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

  @use _allTermVocabularies = new ResolveFlatMapBy(() => [this.terms, 'vocabulary']);
  get associatedVocabularies() {
    return sortByString(uniqueById(this._allTermVocabularies), 'title');
  }

  /**
   * @todo check if this method is obsolete, if so remove it [ST 2020/07/08]
   */
  get shortTitle() {
    return this.title?.substr(0, 200) ?? '';
  }
}
