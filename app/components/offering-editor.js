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

    this.setProperties({
      instructors: [],
      instructorGroups: [],
      learnerGroups: [],
      startDate: moment().format('MM/DD/YYYY'),
      endDate: moment().add(1, 'days').format('MM/DD/YYYY')
    });
  },

  classNames: ['offering-editor'],

  singleOffering: true,
  isMultiDay: false,

  startDate: null,
  endDate: null,
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

  actions: {
    setOfferingType(value) {
      this.set('singleOffering', value);
    },

    toggleMultiDay() {
      this.set('isMultiDay', !this.get('isMultiDay'));
    },

    changeStartTime(date) {
      let newStart = moment(date);
      let startDate = moment(this.get('startDate'));

      startDate.hour(newStart.format('HH'));
      startDate.minute(newStart.format('mm'));
      this.set('startDate', startDate.toDate());
    },

    changeEndTime(date) {
      let newEnd = moment(date);
      let endDate = moment(this.get('endDate'));

      endDate.hour(newEnd.format('HH'));
      endDate.minute(newEnd.format('mm'));
      this.set('endDate', endDate.toDate());
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
      let startDate = moment(this.get('startDate'));
      let endDate;

      if (this.get('isMultiDay')){
        endDate = moment(this.get('endDate'));
      } else {
        endDate = startDate.clone();
        let endTime = moment(this.get('endDate'));
        endDate.hour(endTime.format('HH'));
        endDate.minute(endTime.format('mm'));
      }

      let params = {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        learnerGroups: this.get('learnerGroups')
      };

      if (this.get('singleOffering')) {
        params.room = this.get('room');
        params.instructors = this.get('instructors');
        params.instructorGroups = this.get('instructorGroups');

        this.sendAction('addSingleOffering', params);
      } else {
        this.sendAction('addMultipleOfferings', params);
      }

      this.send('cancel');
    },

    cancel() {
      this.sendAction('closeEditor');
    }
  }
});
