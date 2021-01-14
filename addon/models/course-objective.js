import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { all, map } from 'rsvp';

export default Model.extend({
  title: attr('string'),
  position: attr('number', { defaultValue: 0 }),
  active: attr('boolean', { defaultValue: true }),
  course: belongsTo('course', { async: true }),
  terms: hasMany('term', { async: true }),
  meshDescriptors: hasMany('mesh-descriptor', { async: true }),
  ancestor: belongsTo('course-objective', {
    inverse: 'descendants',
    async: true,
  }),
  descendants: hasMany('course-objective', {
    inverse: 'ancestor',
    async: true,
  }),
  sessionObjectives: hasMany('session-objective', {
    inverse: 'courseObjectives',
    async: true,
  }),
  programYearObjectives: hasMany('program-year-objective', {
    inverse: 'courseObjectives',
    async: true,
  }),

  /**
   * A list of all vocabularies that are associated via terms.
   * @property associatedVocabularies
   * @type {Ember.computed}
   * @public
   */
  associatedVocabularies: computed('terms.@each.vocabulary', async function () {
    const terms = await this.terms;
    const vocabularies = await all(terms.toArray().mapBy('vocabulary'));
    return vocabularies.uniq().sortBy('title');
  }),

  /**
   * A list containing all associated terms and their parent terms.
   * @property termsWithAllParents
   * @type {Ember.computed}
   * @public
   */
  termsWithAllParents: computed('terms.[]', async function () {
    const terms = await this.terms;
    const allTerms = await all(terms.toArray().mapBy('termWithAllParents'));
    return allTerms
      .reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, [])
      .uniq();
  }),

  /**
   * All competencies associated with any program-year objectives linked to this course objective.
   *
   * @property treeCompetencies
   * @type {Ember.computed}
   * @public
   * @todo change name to just "competencies" [ST 2020/07/08]
   */
  treeCompetencies: computed(
    'programYearObjectives.@each.competency',
    async function () {
      const programYearObjectives = await this.programYearObjectives;
      const competencies = await all(programYearObjectives.mapBy('competency'));
      return competencies.uniq();
    }
  ),

  /**
   * Unlink any linked program-year objectives from this course objective
   * if they belong to any program years in the given list.
   *
   * @method removeParentWithProgramYears
   * @param {Array} programYearsToRemove
   * @todo Rename this method to something better [ST 2020/07/08]
   */
  async removeParentWithProgramYears(programYearsToRemove) {
    const programYearObjectives = await this.programYearObjectives;

    await map(programYearObjectives.toArray(), async (programYearObjective) => {
      const programYear = await programYearObjective.get('programYear');
      if (programYearsToRemove.includes(programYear)) {
        programYearObjectives.removeObject(programYearObjective);
        programYearObjective.get('courseObjectives').removeObject(this);
      }
    });
    await this.save();
  },

  /**
   * @todo check if this method is obsolete, if so remove it [ST 2020/07/08]
   */
  shortTitle: computed('title', function () {
    const title = this.title;
    if (title === undefined) {
      return '';
    }
    return title.substr(0, 200);
  }),

  textTitle: computed('title', function () {
    const title = this.title;
    if (title === undefined) {
      return '';
    }
    return title.replace(/(<([^>]+)>)/gi, '');
  }),
});
