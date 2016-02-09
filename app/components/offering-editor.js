import Ember from 'ember';
import DS from 'ember-data';
import moment from 'moment';
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, computed, isEmpty, isPresent, ObjectProxy, RSVP } = Ember;
const { notEmpty } = computed;
const { all, Promise } = RSVP;
const { PromiseArray } = DS;

export default Component.extend(EmberValidations, ValidationError, {
  init() {
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

    if (cohorts && isPresent(cohorts)) {
      cohorts.forEach((cohort) => {
        learnerGroups[cohort.id] = [];
      });
    }

    this.setProperties({ instructors, instructorGroups, learnerGroups, startDate, endDate, startTime, endTime });
  },

  classNames: ['offering-editor'],

  smallGroupMode: true,
  isMultiDay: false,

  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  room: null,

  instructors: null,
  instructorGroups: null,
  learnerGroups: null,

  validations: {
    room : {
      length: {maximum: 60, allowBlank: true, messages: { tooLong: "offerings.errors.roomTooLong" }}
    }
  },

  availableLearnerGroups: computed('cohorts.[]', function() {
    let cohortProxy = ObjectProxy.extend({
      selectedLearnerGroups: [],

      hasAvailableLearnerGroups: notEmpty('filteredAvailableLearnerGroups'),

      filteredAvailableLearnerGroups: computed('content.learnerGroups.[]', 'content.learnerGroups.@each.allDescendants.[]', 'selectedLearnerGroups.[]', function() {
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
      this.validate().then(() => {
      const flashMessages = this.get('flashMessages');
        if (!(this.datesValidated() && this.timesValidated())) {
          flashMessages.alert('general.invalidDatetimes');
          return;
        }
        let datesHash = this.calculateDateTimes();
        let learnerGroups = this.getAllLearnerGroups();
        let params = {
          startDate: datesHash.startDate.toDate(),
          endDate: datesHash.endDate.toDate(),
          learnerGroups
        };

        if (this.get('smallGroupMode')) {
          if (isEmpty(learnerGroups)) {
            this.get('flashMessages').alert('offerings.smallGroupMessage');
            return;
          }

          this.sendAction('addMultipleOfferings', params);
        } else {
          params.room = this.get('room') || 'TBD';
          params.instructors = this.get('instructors');
          params.instructorGroups = this.get('instructorGroups');

          this.sendAction('addSingleOffering', params);
        }

        this.send('cancel');
      }).catch(() => {
        const keys = Ember.keys(this.get('errors'));
        keys.forEach((key) => {
          this.get('flashMessages').alert(this.get('errors.' + key));
        });
      });
    },

    cancel() {
      this.get('flashMessages').clearMessages();
      this.sendAction('closeEditor');
    }
  }
});
