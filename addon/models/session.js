import moment from 'moment';
import DS from 'ember-data';
import Ember from 'ember';
import PublishableModel from 'ilios-common/mixins/publishable-model';
import CategorizableModel from 'ilios-common/mixins/categorizable-model';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';


const { computed, isEmpty, isPresent, RSVP } = Ember;
const { alias, mapBy, sum } = computed;
const { attr, belongsTo, hasMany, Model } = DS;
const { all, Promise } = RSVP;

export default Model.extend(PublishableModel, CategorizableModel, SortableByPosition, {
  title: attr('string'),
  attireRequired: attr('boolean'),
  equipmentRequired: attr('boolean'),
  supplemental: attr('boolean'),
  attendanceRequired: attr('boolean'),
  updatedAt: attr('date'),
  sessionType: belongsTo('session-type', {async: true}),
  course: belongsTo('course', {async: true}),
  ilmSession: belongsTo('ilm-session', {async: true}),
  objectives: hasMany('objective', {async: true}),
  meshDescriptors: hasMany('mesh-descriptor', {async: true}),
  sessionDescription: belongsTo('session-description', {async: true}),
  learningMaterials: hasMany('session-learning-material', {async: true}),
  offerings: hasMany('offering', {async: true}),
  administrators: hasMany('user', {
    async: true,
    inverse: 'administeredSessions'
  }),
  offeringLearnerGroups: mapBy('offerings', 'learnerGroups'),
  offeringLearnerGroupsLength: mapBy('offeringLearnerGroups', 'length'),
  learnerGroupCount: sum('offeringLearnerGroupsLength'),

  isIndependentLearning: computed('ilmSession', function(){
    return !isEmpty(this.belongsTo('ilmSession').id());
  }),

  /**
   * All offerings for this session, sorted by offering startdate in ascending order.
   * @property sortedOfferingsByDate
   * @type {Ember.computed}
   */
  sortedOfferingsByDate: computed('offerings.@each.startDate', function() {
    return new Promise(resolve => {
      this.get('offerings').then(offerings => {
        let filteredOfferings = offerings.filter(offering => isPresent(offering.get('startDate')));
        let sortedOfferings = filteredOfferings.sort((a, b) => {
          let aDate = moment(a.get('startDate'));
          let bDate = moment(b.get('startDate'));
          if(aDate === bDate){
            return 0;
          }
          return aDate > bDate ? 1 : -1;
        });
        resolve(sortedOfferings);
      });
    });
  }),

  /**
   * The earliest start date of all offerings in this session, or, if this is an ILM session, the ILM's due date.
   *
   * @property firstOfferingDate
   * @type {Ember.computed}
   */
  firstOfferingDate: computed('sortedOfferingsByDate.@each.startDate', 'ilmSession.dueDate', function(){
    return new Promise(resolve => {
      this.get('ilmSession').then(ilmSession => {
        if(ilmSession){
          resolve(ilmSession.get('dueDate'));
        } else {
          this.get('sortedOfferingsByDate').then(offerings => {
            if(isEmpty(offerings)){
              resolve(null);
            } else {
              resolve(offerings.get('firstObject.startDate'));
            }
          });
        }
      });
    });
  }),

  /**
   * The maximum duration in hours (incl. fractions) of any session offerings.
   * @property sortedTerms
   * @type {Ember.computed}
   */
  maxSingleOfferingDuration: computed('offerings.@each.startDate', 'offerings.@each.endDate', function(){
    return new Promise(resolve => {
      this.get('offerings').then(offerings => {
        if (! offerings.length) {
          resolve(0);
        } else {
          const sortedOfferings = offerings.toArray().sort(function (a, b) {
            const diffA = moment(a.get('endDate')).diff(moment(a.get('startDate')), 'minutes');
            const diffB = moment(b.get('endDate')).diff(moment(b.get('startDate')), 'minutes');
            if (diffA > diffB) {
              return 1;
            } else if (diffA < diffB) {
              return -1;
            }
            return 0;
          });
          const offering = sortedOfferings[0];
          const duration = moment(offering.get('endDate')).diff(moment(offering.get('startDate')), 'hours', true);
          resolve(duration.toFixed(2));
        }
      });
    });
  }),

  /**
   * The total duration in hours (incl. fractions) of all session offerings.
   * @property sortedTerms
   * @type {Ember.computed}
   */
  totalSumOfferingsDuration: computed('offerings.@each.startDate', 'offerings.@each.endDate', function() {
    return new Promise(resolve => {
      this.get('offerings').then(offerings => {
        if (!offerings.length) {
          resolve(0);
        } else {
          let total = 0;
          offerings.forEach(offering => {
            total = total + moment(offering.get('endDate')).diff(moment(offering.get('startDate')), 'hours', true);
          });
          resolve(total.toFixed(2));
        }
      });
    });
  }),
  optionalPublicationLengthFields: ['terms', 'objectives', 'meshDescriptors'],
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
  associatedOfferingLearnerGroups: computed('offerings.@each.learnerGroups', function(){
    return new Promise(resolve => {
      this.get('offerings').then(offerings => {
        all(offerings.mapBy('learnerGroups')).then(offeringLearnerGroups => {
          let allGroups = [];
          offeringLearnerGroups.forEach(learnerGroups => {
            learnerGroups.forEach(group => {
              allGroups.pushObject(group);
            });
          });
          let groups = allGroups ? allGroups.uniq().sortBy('title') : [];
          resolve(groups);
        });
      });
    });
  }),

  /**
   * Learner-groups associated with this session via its ILM.
   * @property associatedIlmLearnerGroups
   * @type {Ember.computed}
   */
  associatedIlmLearnerGroups: computed('ilmSession.learnerGroups', function(){
    return new Promise(resolve => {
      this.get('ilmSession').then(ilmSession => {
        if (! isPresent(ilmSession)) {
          resolve([]);
          return;
        }

        ilmSession.get('learnerGroups').then(learnerGroups => {
          let sortedGroups = learnerGroups.sortBy('title');
          resolve(sortedGroups);
        });
      });
    });
  }),

  /**
   * Learner-groups associated with this session via its ILM and offerings.
   * @property associatedLearnerGroups
   * @type {Ember.computed}
   */
  associatedLearnerGroups: computed('associatedIlmLearnerGroups.[]', 'associatedOfferingLearnerGroups.[]', function(){
    return new Promise(resolve => {
      this.get('associatedIlmLearnerGroups').then(ilmLearnerGroups => {
        this.get('associatedOfferingLearnerGroups').then(offeringLearnerGroups => {
          let allGroups = [].pushObjects(offeringLearnerGroups).pushObjects(ilmLearnerGroups);
          if (! isEmpty(allGroups)) {
            allGroups = allGroups.uniq().sortBy('title');
          }
          resolve(allGroups);
        });
      });
    });
  }),

  assignableVocabularies: alias('course.assignableVocabularies'),

  /**
   * A list of session objectives, sorted by position and title.
   * @property sortedObjectives
   * @type {Ember.computed}
   */
  sortedObjectives: computed('objectives.@each.position', 'objectives.@each.title', async function() {
    const objectives = await this.get('objectives');
    return objectives.toArray().sort(this.positionSortingCallback);
  })

});
