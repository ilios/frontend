import Ember from 'ember';
import DS from 'ember-data';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, isEmpty, isPresent, ObjectProxy, RSVP, inject } = Ember;
const { notEmpty, alias } = computed;
const { all, Promise } = RSVP;
const { service } = inject;
const { PromiseArray } = DS;

const Validations = buildValidations({
  room: [
    validator('length', {
      max: 255
    }),
  ],
  site: [
    validator('length', {
      max: 255
    }),
  ],
  numberOfWeeks: {
    dependentKeys: ['makeRecurring'],
    disabled(){
      return !this.get('model.makeRecurring');
    },
    validators: [
      validator('presence', {
        presence: true
      }),
      validator('number', {
        allowString: true,
        integer: true,
        gt: 0,
      }),
    ]
  }
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  flashMessages: service(),
  iliosConfig: service(),
  didReceiveAttrs() {
    this._super(...arguments);

    const instructors = [];
    const instructorGroups = [];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    const startTime = new Date().setHours(8, 0, 0, 0);
    const endTime = new Date().setHours(9, 0, 0, 0);

    const cohorts = this.get('cohorts');
    const learnerGroups = {};
    const recurringDays = [];

    if (cohorts && isPresent(cohorts)) {
      cohorts.forEach((cohort) => {
        learnerGroups[cohort.id] = [];
      });
    }

    this.setProperties({ instructors, instructorGroups, learnerGroups, startDate, endDate, startTime, endTime, recurringDays });
  },

  classNames: ['offering-editor'],

  smallGroupMode: true,
  isMultiDay: false,

  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  room: null,
  site: null,

  instructors: null,
  instructorGroups: null,
  learnerGroups: null,

  showErrorsFor: [],

  makeRecurring: false,
  recurringDays: null,
  numberOfWeeks: null,

  /**
   * A promise that resolves to TRUE if the offering site feature is enabled, otherwise FALSE.
   * @property isOfferingSiteEnabled
   * @type {Ember.computed.alias}
   * @public
   */
  isOfferingSiteEnabled: alias('iliosConfig.isOfferingSiteEnabled'),

  availableLearnerGroups: computed('cohorts.[]', function() {
    let cohortProxy = ObjectProxy.extend({
      selectedLearnerGroups: [],

      hasAvailableLearnerGroups: notEmpty('filteredAvailableLearnerGroups'),

      filteredAvailableLearnerGroups: computed('content.learnerGroups.[]', 'content.learnerGroups.@each.allDescendants', 'selectedLearnerGroups.[]', function() {
        let defer = RSVP.defer();
        let proxy = this;

        let activeGroupFilter = (learnerGroup) => {
          return (
            learnerGroup.get('title') !== undefined &&
            proxy.get('selectedLearnerGroups') &&
            !proxy.get('selectedLearnerGroups').contains(learnerGroup)
          );
        };

        this.get('content.topLevelLearnerGroups').then((cohortGroups) => {
          let learnerGroups = [];
          let promises = [];

          cohortGroups.forEach((learnerGroup) => {
            learnerGroups.pushObject(learnerGroup);

            let promise = new Promise((resolve) => {
              learnerGroup.get('allDescendants').then((descendants) => {
                learnerGroups.pushObjects(descendants);
                resolve();
              });
            });

            promises.pushObject(promise);
          });

          all(promises).then(() => {
            defer.resolve(learnerGroups.filter(activeGroupFilter).sortBy('sortTitle'));
          });
        });

        return PromiseArray.create({
          promise: defer.promise
        });
      }),
    });

    let cohorts = this.get('cohorts') ? this.get('cohorts') : [];

    return cohorts.map((cohort) => {
      let proxy = cohortProxy.create({
        content: cohort,
        selectedLearnerGroups: this.get('learnerGroups')[cohort.id]
      });

      return proxy;
    }).sortBy('title');
  }),

  datesValidated() {
    const resetStartDate = this.get('startDate').setHours(0, 0, 0, 0);
    const resetEndDate = this.get('endDate').setHours(0, 0, 0, 0);

    let isEndDateOnOrBeforeStartDate = this.get('isMultiDay') && resetStartDate >= resetEndDate;

    return isEndDateOnOrBeforeStartDate ? false : true;
  },

  timesValidated() {
    const startTime = this.get('startTime');
    const endTime = this.get('endTime');

    let isEndTimeOnOrBeforeStartTime = !this.get('isMultiDay') && startTime >= endTime;

    return isEndTimeOnOrBeforeStartTime ? false : true;
  },

  calculateDateTimes() {
    let startDate = moment(this.get('startDate'));
    let endDate;

    let starTime = moment(this.get('startTime'));
    startDate.hour(starTime.format('HH'));
    startDate.minute(starTime.format('mm'));

    if (this.get('isMultiDay')){
      endDate = moment(this.get('endDate'));
    } else {
      endDate = startDate.clone();
    }

    let endTime = moment(this.get('endTime'));
    endDate.hour(endTime.format('HH'));
    endDate.minute(endTime.format('mm'));

    return { startDate, endDate };
  },

  getAllLearnerGroups() {
    const groupHash = this.get('learnerGroups');
    const output = [];

    for (let key in groupHash) {
      output.pushObjects(groupHash[key]);
    }

    return output;
  },

  defaultCheckedDay: computed('startDate', function() {
    const startDate = this.get('startDate');

    return moment(startDate).day().toString();
  }),

  actions: {
    setOfferingType(value) {
      this.set('smallGroupMode', value);
    },

    toggleMultiDay() {
      this.set('isMultiDay', !this.get('isMultiDay'));
    },

    changeStartTime(value, type) {
      let startTime = moment(this.get('startTime'));

      if (type === 'hour') {
        startTime.hour(value);
      } else {
        startTime.minute(value);
      }

      this.set('startTime', startTime.toDate());
    },

    changeEndTime(value, type) {
      let endTime = moment(this.get('endTime'));

      if (type === 'hour') {
        endTime.hour(value);
      } else {
        endTime.minute(value);
      }

      this.set('endTime', endTime.toDate());
    },

    addInstructor(instructor){
      this.get('instructors').pushObject(instructor);
    },

    addInstructorGroup(instructorGroup) {
      this.get('instructorGroups').pushObject(instructorGroup);
    },

    removeInstructor(instructor){
      this.get('instructors').removeObject(instructor);
    },

    removeInstructorGroup(instructorGroup){
      this.get('instructorGroups').removeObject(instructorGroup);
    },

    // If the group has no descendants then we add it, otherwise we add
    // the descendants, but not the parent (add lowest node at all times).
    addLearnerGroup(group, cohortId) {
      let learnerGroups = this.get('learnerGroups');

      group.get('allDescendants').then((descendants) => {
        if (isEmpty(descendants)) {
          learnerGroups[cohortId].addObject(group);
        } else {
          learnerGroups[cohortId].addObjects(descendants);
        }
      });
    },

    removeLearnerGroup(group, cohortId) {
      this.get('learnerGroups')[cohortId].removeObject(group);
    },

    create() {
      const flashMessages = this.get('flashMessages');
      this.send('addErrorDisplayFor', 'room')
      this.send('addErrorDisplayFor', 'site');
      this.send('addErrorDisplayFor', 'numberOfWeeks');


      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          if (!(this.datesValidated() && this.timesValidated())) {
            flashMessages.alert('general.invalidDatetimes');
            return;
          }

          let datesHash = this.calculateDateTimes();
          let learnerGroups = this.getAllLearnerGroups();
          const days = this.get('recurringDays');
          const numberOfWeeks = this.get('numberOfWeeks');
          let recurringOptions = {
            days,
            numberOfWeeks
          };
          let params = {
            startDate: datesHash.startDate.toDate(),
            endDate: datesHash.endDate.toDate(),
            learnerGroups,
            recurringOptions
          };

          if (this.get('smallGroupMode')) {
            if (isEmpty(learnerGroups)) {
              this.get('flashMessages').alert('offerings.smallGroupMessage');
              return;
            }

            if (this.get('makeRecurring')) {
              this.sendAction('addMultipleOfferingsRecurring', params);
            } else {
              this.sendAction('addMultipleOfferings', params);
            }
          } else {
            params.room = this.get('room') || 'TBD';
            params.site = this.get('site');
            params.instructors = this.get('instructors');
            params.instructorGroups = this.get('instructorGroups');

            if (this.get('makeRecurring')) {
              this.sendAction('addSingleOfferingRecurring', params);
            } else {
              this.sendAction('addSingleOffering', params);
            }
          }
          this.send('clearErrorDisplay');
          this.send('cancel');
        }
      });
    },

    cancel() {
      this.get('flashMessages').clearMessages();
      this.sendAction('closeEditor');
    },

    toggleMakeRecurring() {
      this.set('makeRecurring', !this.get('makeRecurring'))
    },
    toggleDayInRecurrindgDays(day){
      let recurringDays = this.get('recurringDays');
      if (recurringDays.contains(day)) {
        this.get('recurringDays').removeObject(day);
      } else {
        this.get('recurringDays').pushObject(day);
      }
    }
  }
});
