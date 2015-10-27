import Ember from 'ember';
import DS from 'ember-data';
import moment from 'moment';

const { Component, computed, isEmpty, ObjectProxy, RSVP } = Ember;
const { notEmpty } = computed;
const { all, Promise } = RSVP;
const { PromiseArray } = DS;

export default Component.extend({
  init() {
    this._super(...arguments);

    const instructors = [];
    const instructorGroups = [];
    const learnerGroups = [];
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
    const startTime = new Date().setHours(8, 0, 0, 0);
    const endTime = new Date().setHours(9, 0, 0, 0);

    this.setProperties({ instructors, instructorGroups, learnerGroups, startDate, endDate, startTime, endTime });
  },

  classNames: ['offering-editor'],

  singleOffering: true,
  isMultiDay: false,

  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  room: null,

  instructors: null,
  instructorGroups: null,
  learnerGroups: null,

  availableLearnerGroups: computed('cohorts.[]', 'learnerGroups.[]', function() {
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
        selectedLearnerGroups: this.get('learnerGroups')
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

  actions: {
    setOfferingType(value) {
      this.set('singleOffering', value);
    },

    toggleMultiDay() {
      this.set('isMultiDay', !this.get('isMultiDay'));
    },

    changeStartTime(date) {
      let newStart = moment(date);
      let startTime = moment(this.get('startTime'));

      startTime.hour(newStart.format('HH'));
      startTime.minute(newStart.format('mm'));
      this.set('startTime', startTime.toDate());
    },

    changeEndTime(date) {
      let newEnd = moment(date);
      let endTime = moment(this.get('endTime'));

      endTime.hour(newEnd.format('HH'));
      endTime.minute(newEnd.format('mm'));
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
    addLearnerGroup(group) {
      let learnerGroups = this.get('learnerGroups');

      group.get('allDescendants').then((descendants) => {
        if (isEmpty(descendants)) {
          learnerGroups.addObject(group);
        } else {
          learnerGroups.addObjects(descendants);
        }
      });
    },

    removeLearnerGroup(group) {
      this.get('learnerGroups').removeObject(group);
    },

    create() {
      if (this.datesValidated() && this.timesValidated()) {
        let datesHash = this.calculateDateTimes();

        let params = {
          startDate: datesHash.startDate.toDate(),
          endDate: datesHash.endDate.toDate(),
          learnerGroups: this.get('learnerGroups')
        };

        if (this.get('singleOffering')) {
          params.room = this.get('room') || 'TBD';
          params.instructors = this.get('instructors');
          params.instructorGroups = this.get('instructorGroups');

          this.sendAction('addSingleOffering', params);
        } else {
          this.sendAction('addMultipleOfferings', params);
        }

        this.send('cancel');
      } else {
        this.get('flashMessages').alert('general.invalidDatetimes');
      }
    },

    cancel() {
      this.get('flashMessages').clearMessages();
      this.sendAction('closeEditor');
    }
  }
});
