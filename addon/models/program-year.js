import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { all } from 'rsvp';

const { alias } = computed;

export default Model.extend({
  startYear: attr('string'),
  locked: attr('boolean'),
  archived: attr('boolean'),
  program: belongsTo('program', { async: true }),
  cohort: belongsTo('cohort', { async: true }),
  directors: hasMany('user', { async: true }),
  competencies: hasMany('competency', { async: true }),
  programYearObjectives: hasMany('program-year-objective', { async: true }),
  terms: hasMany('term', { async: true }),

  xObjectives: alias('programYearObjectives'),
  assignableVocabularies: alias('program.school.vocabularies'),

  classOfYear: computed('startYear', 'program.duration', async function () {
    const program = await this.program;
    return parseInt(this.startYear, 10) + parseInt(program.duration, 10);
  }),
  requiredPublicationIssues: computed('startYear', 'cohort', 'program', function () {
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed(
    'directors.length',
    'competencies.length',
    'terms.length',
    'programYearObjectives.length',
    function () {
      return this.getOptionalPublicationIssues();
    }
  ),

  /**
   * A list of program-year objectives, sorted by position.
   * @property sortedProgramYearObjectives
   * @type {Ember.computed}
   * @public
   */
  sortedProgramYearObjectives: computed('programYearObjectives.@each.position', async function () {
    const objectives = await this.programYearObjectives;
    return objectives.toArray().sort(sortableByPosition);
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
   * The number of terms attached to this model
   * @property termCount
   * @type {Ember.computed}
   * @public
   */
  termCount: computed('terms.[]', function () {
    const termIds = this.hasMany('terms').ids();
    return termIds.length;
  }),
});
