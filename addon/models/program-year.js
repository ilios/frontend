import Ember from 'ember';
import DS from 'ember-data';
import PublishableModel from 'ilios-common/mixins/publishable-model';
import CategorizableModel from 'ilios-common/mixins/categorizable-model';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';


const { computed, RSVP } = Ember;
const { alias } = computed;
const { Promise } = RSVP;

export default DS.Model.extend(PublishableModel, CategorizableModel, SortableByPosition, {
  startYear: DS.attr('string'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  program: DS.belongsTo('program', {async: true}),
  cohort: DS.belongsTo('cohort', {async: true}),
  directors: DS.hasMany('user', {async: true}),
  competencies: DS.hasMany('competency', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  stewards: DS.hasMany('program-year-steward', {async: true}),
  academicYear: computed('startYear', function(){
    return this.get('startYear') + ' - ' + (parseInt(this.get('startYear'), 10) + 1);
  }),
  classOfYear: computed('startYear', 'program.duration', function(){
    return (parseInt(this.get('startYear'), 10) + parseInt(this.get('program.duration'), 10));
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
  requiredPublicationSetFields: ['startYear', 'cohort', 'program'],
  optionalPublicationLengthFields: ['directors', 'competencies', 'terms', 'objectives'],
  assignableVocabularies: alias('program.school.vocabularies'),

  /**
   * A list of program-year objectives, sorted by position and title.
   * @property sortedObjectives
   * @type {Ember.computed}
   */
  sortedObjectives: computed('objectives.@each.position', 'objectives.@each.title', function() {
    return new Promise(resolve => {
      this.get('objectives').then(objectives => {
        resolve(objectives.toArray().sort(this.positionSortingCallback));
      });
    });
  })
});
