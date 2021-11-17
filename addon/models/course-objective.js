import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { map } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';

export default class CourseObjective extends Model {
  @attr('string')
  title;

  @attr('number', { defaultValue: 0 })
  position;

  @attr('boolean', { defaultValue: true })
  active;

  @belongsTo('course', { async: true })
  course;

  @hasMany('term', { async: true })
  terms;

  @hasMany('mesh-descriptor', { async: true })
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

  @use _allTermVocabularies = new ResolveFlatMapBy(() => [this.terms, 'vocabulary']);
  get associatedVocabularies() {
    return this._allTermVocabularies?.uniq().sortBy('title');
  }

  @use allTerms = new ResolveFlatMapBy(() => [this.terms, 'termWithAllParents']);

  get termsWithAllParents() {
    return this.allTerms?.uniq();
  }

  @use allTermCompetencies = new ResolveAsyncValue(() => [
    this.programYearObjectives.mapBy('competency'),
  ]);

  /**
   * All competencies associated with any program-year objectives linked to this course objective.
   */
  get treeCompetencies() {
    return this.allTermCompetencies?.uniq();
  }

  /**
   * Unlink any linked program-year objectives from this course objective
   * if they belong to any program years in the given list.
   */
  async removeParentWithProgramYears(programYearsToRemove) {
    const programYearObjectives = (await this.programYearObjectives).toArray();

    await map(programYearObjectives, async (programYearObjective) => {
      const programYear = await programYearObjective.programYear;
      if (programYearsToRemove.includes(programYear)) {
        programYearObjectives.removeObject(programYearObjective);
        programYearObjective.courseObjectives.removeObject(this);
      }
    });
    await this.save();
  }

  /**
   * @todo check if this method is obsolete, if so remove it [ST 2020/07/08]
   */
  get shortTitle() {
    return this.title?.substr(0, 200) ?? '';
  }
}
