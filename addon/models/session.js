import { computed } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import moment from 'moment';
import DS from 'ember-data';
import PublishableModel from 'ilios-common/mixins/publishable-model';
import CategorizableModel from 'ilios-common/mixins/categorizable-model';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';


const { alias, mapBy, sum } = computed;
const { attr, belongsTo, hasMany, Model } = DS;
const { all } = RSVP;

export default Model.extend(PublishableModel, CategorizableModel, SortableByPosition, {
  title: attr('string'),
  attireRequired: attr('boolean'),
  equipmentRequired: attr('boolean'),
  supplemental: attr('boolean'),
  attendanceRequired: attr('boolean'),
  updatedAt: attr('date'),
  sessionType: belongsTo('session-type', { async: true }),
  course: belongsTo('course', { async: true }),
  ilmSession: belongsTo('ilm-session', { async: true }),
  objectives: hasMany('objective', { async: true }),
  meshDescriptors: hasMany('mesh-descriptor', { async: true }),
  sessionDescription: belongsTo('session-description', { async: true }),
  learningMaterials: hasMany('session-learning-material', { async: true }),
  offerings: hasMany('offering', { async: true }),
  administrators: hasMany('user', {
    async: true,
    inverse: 'administeredSessions'
  }),
  offeringLearnerGroups: mapBy('offerings', 'learnerGroups'),
  offeringLearnerGroupsLength: mapBy('offeringLearnerGroups', 'length'),
  learnerGroupCount: sum('offeringLearnerGroupsLength'),
  assignableVocabularies: alias('course.assignableVocabularies'),

  isIndependentLearning: computed('ilmSession', function () {
    return !isEmpty(this.belongsTo('ilmSession').id());
  }),

  /**
   * All offerings for this session, sorted by offering start date in ascending order.
   * @property sortedOfferingsByDate
   * @type {Ember.computed}
   */
  sortedOfferingsByDate: computed('offerings.@each.startDate', async function () {
    const offerings = await this.get('offerings');
    const filteredOfferings = offerings.filter(offering => isPresent(offering.get('startDate')));
    return filteredOfferings.sort((a, b) => {
      let aDate = moment(a.get('startDate'));
      let bDate = moment(b.get('startDate'));
      if (aDate === bDate) {
        return 0;
      }
      return aDate > bDate ? 1 : -1;
    });
  }),

  /**
   * The earliest start date of all offerings in this session, or, if this is an ILM session, the ILM's due date.
   *
   * @property firstOfferingDate
   * @type {Ember.computed}
   */
  firstOfferingDate: computed('sortedOfferingsByDate.@each.startDate', 'ilmSession.dueDate', async function () {
    const ilmSession = await this.get('ilmSession');
    if (ilmSession) {
      return ilmSession.get('dueDate');
    }

    const offerings = await this.get('sortedOfferingsByDate');
    if (isEmpty(offerings)) {
      return null;
    }

    return offerings.get('firstObject.startDate');
  }),

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings.
   * @property maxSingleOfferingDuration
   * @type {Ember.computed}
   */
  maxSingleOfferingDuration: computed('offerings.@each.startDate', 'offerings.@each.endDate', async function () {
    const offerings = await this.get('offerings');
    if (isEmpty(offerings)) {
      return 0;
    }
    const sortedOfferings = offerings.toArray().sort(function (a, b) {
      const diffA = moment(a.get('endDate')).diff(moment(a.get('startDate')), 'minutes');
      const diffB = moment(b.get('endDate')).diff(moment(b.get('startDate')), 'minutes');
      if (diffA > diffB) {
        return -1;
      } else if (diffA < diffB) {
        return 1;
      }
      return 0;
    });

    const offering = sortedOfferings[0];
    const duration = moment(offering.get('endDate')).diff(moment(offering.get('startDate')), 'hours', true);

    return duration.toFixed(2);
  }),

  /**
   * The total duration in hours (incl. fractions) of all session offerings.
   * @property totalSumOfferingsDuration
   * @type {Ember.computed}
   */
  totalSumOfferingsDuration: computed('offerings.@each.startDate', 'offerings.@each.endDate', async function () {
    const offerings = await this.get('offerings');
    if (isEmpty(offerings)) {
      return 0;
    }

    return offerings.reduce((total, offering) => {
      return total + moment(offering.get('endDate')).diff(moment(offering.get('startDate')), 'hours', true);
    }, 0).toFixed(2);
  }),

  /**
   * Total duration in hours for offerings and ILM Sessions
   * If both ILM and offerings are present sum them
   * @property totalSumDuration
   * @type {Ember.computed}
   */
  totalSumDuration: computed('maxSingleOfferingDuration', 'ilmSession.hours', async function () {
    const maxSingleOfferingDuration = await this.get('maxSingleOfferingDuration');
    const ilmSession = await this.get('ilmSession');
    if (!ilmSession) {
      return maxSingleOfferingDuration;
    }

    const ilmHours = ilmSession.get('hours');

    return parseInt(ilmHours, 10) + parseInt(maxSingleOfferingDuration, 10);
  }),

  requiredPublicationIssues: computed(
    'title',
    'offerings.length',
    'ilmSession.dueDate',
    'isIndependentLearning',
    function(){
      if(!this.get('isIndependentLearning')){
        this.set('requiredPublicationLengthFields', ['offerings']);
        this.set('requiredPublicationSetFields', ['title']);
      } else {
        this.set('requiredPublicationLengthFields', []);
        this.set('requiredPublicationSetFields', ['title', 'ilmSession.dueDate']);
      }
      return this.getRequiredPublicationIssues();
    }
  ),
  optionalPublicationIssues: computed(
    'terms.length',
    'objectives.length',
    'meshDescriptors.length',
    function(){
      return this.getOptionalPublicationIssues();
    }
  ),

  /**
   * Learner-groups associated with this session via its offerings.
   *
   * @property associatedOfferingLearnerGroups
   * @type {Ember.computed}
   */
  associatedOfferingLearnerGroups: computed('offerings.@each.learnerGroups', async function(){
    const offerings = await this.get('offerings');
    const offeringLearnerGroups = await all(offerings.mapBy('learnerGroups'));
    return offeringLearnerGroups.reduce((array, set) => {
      array.pushObjects(set.toArray());
      return array;
    }, []).uniq().sortBy('title');
  }),

  /**
   * Learner-groups associated with this session via its ILM.
   * @property associatedIlmLearnerGroups
   * @type {Ember.computed}
   */
  associatedIlmLearnerGroups: computed('ilmSession.learnerGroups', async function(){
    const ilmSession = await this.get('ilmSession');
    if (! isPresent(ilmSession)) {
      return [];
    }

    const learnerGroups = await ilmSession.get('learnerGroups');
    return learnerGroups.sortBy('title');
  }),

  /**
   * Learner-groups associated with this session via its ILM and offerings.
   * @property associatedLearnerGroups
   * @type {Ember.computed}
   */
  associatedLearnerGroups: computed('associatedIlmLearnerGroups.[]', 'associatedOfferingLearnerGroups.[]', async function(){
    const ilmLearnerGroups = await this.get('associatedIlmLearnerGroups');
    const offeringLearnerGroups = await this.get('associatedOfferingLearnerGroups');
    const allGroups = [].pushObjects(offeringLearnerGroups).pushObjects(ilmLearnerGroups);
    return allGroups.uniq().sortBy('title');
  }),

  /**
   * A list of session objectives, sorted by position (asc) and then id (desc).
   * @property sortedObjectives
   * @type {Ember.computed}
   */
  sortedObjectives: computed('objectives.@each.position', async function() {
    const objectives = await this.get('objectives');
    return objectives.toArray().sort(this.positionSortingCallback);
  }),

  init() {
    this._super(...arguments);
    this.set('optionalPublicationLengthFields', ['terms', 'objectives', 'meshDescriptors']);
  },
});
