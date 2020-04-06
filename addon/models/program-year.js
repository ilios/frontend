import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { all } from 'rsvp';

const { alias, oneWay, collect, sum, not } = computed;

export default Model.extend({
  startYear: attr('string'),
  locked: attr('boolean'),
  archived: attr('boolean'),
  publishedAsTbd: attr('boolean'),
  published: attr('boolean'),
  program: belongsTo('program', {async: true}),
  cohort: belongsTo('cohort', {async: true}),
  directors: hasMany('user', {async: true}),
  competencies: hasMany('competency', {async: true}),
  objectives: hasMany('objective', {async: true}),
  stewards: hasMany('program-year-steward', {async: true}),
  terms: hasMany('term', {async: true}),

  assignableVocabularies: alias('program.school.vocabularies'),

  academicYear: computed('startYear', function(){
    return this.get('startYear') + ' - ' + (parseInt(this.get('startYear'), 10) + 1);
  }),
  classOfYear: computed('startYear', 'program.duration', async function(){
    const program = await this.get('program');
    return (parseInt(this.startYear, 10) + parseInt(program.duration, 10));
  }),
  requiredPublicationIssues: computed('startYear', 'cohort', 'program', function(){
    return this.getRequiredPublicationIssues();
  }),
  optionalPublicationIssues: computed(
    'directors.length',
    'competencies.length',
    'terms.length',
    'objectives.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),

  /**
   * A list of program-year objectives, sorted by position and title.
   * @property sortedObjectives
   * @type {Ember.computed}
   * @public
   */
  sortedObjectives: computed('objectives.@each.position', 'objectives.@each.title', async function() {
    const objectives = await this.get('objectives');
    return objectives.toArray().sort(sortableByPosition);
  }),

  /**
   * A list of all vocabularies that are associated via terms.
   * @property associatedVocabularies
   * @type {Ember.computed}
   * @public
   */
  associatedVocabularies: computed('terms.@each.vocabulary', async function () {
    const terms = await this.get('terms');
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
    const terms = await this.get('terms');
    const allTerms = await all(terms.toArray().mapBy('termWithAllParents'));
    return (allTerms.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, [])).uniq();
  }),

  /**
   * The number of terms attached to this model
   * @property termCount
   * @type {Ember.computed}
   * @public
   */
  termCount: computed('terms.[]', function(){
    const termIds = this.hasMany('terms').ids();
    return termIds.length;
  }),

  init() {
    this._super(...arguments);
    this.set('requiredPublicationSetFields', ['startYear', 'cohort', 'program']);
    this.set('optionalPublicationLengthFields', ['directors', 'competencies', 'terms', 'objectives']);
    this.set('requiredPublicationLengthFields', []);
    this.set('optionalPublicationSetFields', []);
  },
  isPublished: alias('published'),
  isNotPublished: not('isPublished'),
  isScheduled: oneWay('publishedAsTbd'),
  isPublishedOrScheduled: computed('publishTarget.isPublished', 'publishTarget.isScheduled', function(){
    return this.get('publishedAsTbd') || this.get('isPublished');
  }),
  allPublicationIssuesCollection: collect('requiredPublicationIssues.length', 'optionalPublicationIssues.length'),
  allPublicationIssuesLength: sum('allPublicationIssuesCollection'),
  requiredPublicationSetFields: null,
  requiredPublicationLengthFields: null,
  optionalPublicationSetFields: null,
  optionalPublicationLengthFields: null,
  getRequiredPublicationIssues(){
    const issues = [];
    this.requiredPublicationSetFields.forEach(val => {
      if(!this.get(val)){
        issues.push(val);
      }
    });

    this.requiredPublicationLengthFields.forEach(val => {
      if(this.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  },
  getOptionalPublicationIssues(){
    const issues = [];
    this.optionalPublicationSetFields.forEach(val => {
      if(!this.get(val)){
        issues.push(val);
      }
    });

    this.optionalPublicationLengthFields.forEach(val => {
      if(this.get(val + '.length') === 0){
        issues.push(val);
      }
    });

    return issues;
  },
});
