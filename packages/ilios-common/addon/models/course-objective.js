import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class CourseObjective extends Model {
  @attr('string')
  title;

  @attr('number', { defaultValue: 0 })
  position;

  @attr('boolean', { defaultValue: true })
  active;

  @belongsTo('course', { async: true, inverse: 'courseObjectives' })
  course;

  @hasMany('term', { async: true, inverse: 'courseObjectives' })
  terms;

  @hasMany('mesh-descriptor', { async: true, inverse: 'courseObjectives' })
  meshDescriptors;

  @belongsTo('course-objective', {
    inverse: 'descendants',
    async: true,
  })
  ancestor;

  @hasMany('course-objective', {
    inverse: 'ancestor',
    async: true,
  })
  descendants;

  @hasMany('session-objective', {
    inverse: 'courseObjectives',
    async: true,
  })
  sessionObjectives;

  @hasMany('program-year-objective', {
    inverse: 'courseObjectives',
    async: true,
  })
  programYearObjectives;

  @cached
  get _termsData() {
    return new TrackedAsyncData(this.terms);
  }
  @cached
  get _termVocabulariesData() {
    if (!this._termsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._termsData.value.map((t) => t.vocabulary)));
  }

  get associatedVocabularies() {
    if (!this._termVocabulariesData?.isResolved) {
      return [];
    }
    return sortBy(uniqueValues(this._termVocabulariesData.value), 'title');
  }

  @cached
  get _programYearObjectivesData() {
    return new TrackedAsyncData(this.programYearObjectives);
  }

  @cached
  get _allTermCompetencies() {
    if (!this._programYearObjectivesData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this._programYearObjectivesData.value.map((o) => o.competency)),
    );
  }

  /**
   * All competencies associated with any program-year objectives linked to this course objective.
   */
  get treeCompetencies() {
    if (!this._allTermCompetencies?.isResolved) {
      return [];
    }

    return uniqueValues(this._allTermCompetencies.value);
  }
}
