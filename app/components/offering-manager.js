import Ember from 'ember';
import DS from 'ember-data';
import moment from 'moment';
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, computed, copy, inject, isEmpty, ObjectProxy, RSVP } = Ember;
const { alias, notEmpty, sort } = computed;
const { all, Promise } = RSVP;
const { PromiseArray, PromiseObject } = DS;
const { service } = inject;


export default Component.extend(EmberValidations, ValidationError, {
  init() {
    this._super(...arguments);

    this.set('learnerGroups', {});
  },

  currentUser: service(),
  offering: null,
  isEditing: false,
  editable: true,
  sortBy: ['lastName', 'firstName'],
  classNames: ['offering-manager'],
  sortedInstructors: sort('instructors', 'sortBy'),
  isMultiDay: false,
  cohorts: alias('offering.session.course.cohorts'),
  availableInstructorGroups: alias('offering.session.course.school.instructorGroups'),
  showRemoveConfirmation: false,
  buffer: null,
  allInstructors: computed('instructors.[]', 'instructorGroups.@each.users.[]', function(){
    var self = this;
    var defer = Ember.RSVP.defer();
    var instructorGroups = this.get('instructorGroups');
    var promises = instructorGroups.getEach('users');
    promises.pushObject(self.get('instructors'));
    Ember.RSVP.all(promises).then(function(trees){
      var instructors = trees.reduce(function(array, set){
        return array.pushObjects(set.toArray());
      }, []);
      instructors = instructors.uniq().sortBy('lastName', 'firstName');
      defer.resolve(instructors);
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),

  learnerGroups: null,

  changeFlag: false,

  validations: {
    'buffer.room' : {
      length: {maximum: 60, allowBlank: true, messages: { tooLong: "offerings.errors.roomTooLong" }}
    }
  },

  filteredCohorts: computed('cohorts.[]', 'filter', 'changeFlag', function(){
    let cohortProxy = ObjectProxy.extend({
      selectedLearnerGroups: [],

      hasAvailableLearnerGroups: notEmpty('filteredAvailableLearnerGroups'),

      filter: '',

      filteredAvailableLearnerGroups: computed('content.learnerGroups.[]', 'content.learnerGroups.@each.allDescendants.[]', 'selectedLearnerGroups.[]', 'filter', function(){
        let defer = RSVP.defer();
        let proxy = this;
        let filter = proxy.get('filter');
        let exp = new RegExp(filter, 'gi');

        let activeGroupFilter = function(learnerGroup) {
          let searchTerm = `${learnerGroup.get('title')}${learnerGroup.get('allParentsTitle')}`;

          return (
            learnerGroup.get('title') !== undefined &&
            proxy.get('selectedLearnerGroups') &&
            exp.test(searchTerm) &&
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
        selectedLearnerGroups: this.get('learnerGroups')[cohort.id] || []
      });

      return proxy;
    }).sortBy('title');
  }),

  datesValidated() {
    const resetStartDate = this.get('buffer.startDate').setHours(0, 0, 0, 0);
    const resetEndDate = this.get('buffer.endDate').setHours(0, 0, 0, 0);

    let isEndDateOnOrBeforeStartDate = this.get('buffer.isMultiDay') && resetStartDate >= resetEndDate;

    return isEndDateOnOrBeforeStartDate ? false : true;
  },

  timesValidated() {
    const isSingleDay = !this.get('buffer.isMultiDay');
    const startTime = this.get('buffer.startTime');
    const endTime = this.get('buffer.endTime');

    // Covers edge case where user switches from multi-day to single-day in edit mode
    let revisedEndTime = copy(startTime);
    revisedEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    let isEndTimeOnOrBeforeStartTime = isSingleDay && startTime >= revisedEndTime;

    return isEndTimeOnOrBeforeStartTime ? false : true;
  },

  calculateDateTimes() {
    let startDate = moment(this.get('buffer.startDate'));
    let endDate;

    let starTime = moment(this.get('buffer.startTime'));
    startDate.hour(starTime.format('HH'));
    startDate.minute(starTime.format('mm'));

    if (this.get('buffer.isMultiDay')){
      endDate = moment(this.get('buffer.endDate'));
    } else {
      endDate = startDate.clone();
    }

    let endTime = moment(this.get('buffer.endTime'));
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

  userCanDelete: computed('offering.session.course', 'offering.allInstructors.[]', 'currentUser.model.directedCourses.[]', function(){
    const offering = this.get('offering');
    if(isEmpty(offering)){
      return false;
    }

    let defer = RSVP.defer();
    this.get('currentUser.userIsDeveloper').then(isDeveloper => {
      if(isDeveloper){
        defer.resolve(true);
      } else {
        this.get('currentUser.model').then(user => {
          offering.get('allInstructors').then(allInstructors => {
            if(allInstructors.contains(user)){
              defer.resolve(true);
            } else {
              offering.get('session').then(session => {
                session.get('course').then(course => {
                  user.get('directedCourses').then(directedCourses => {
                    defer.resolve(directedCourses.contains(course));
                  });
                });
              });
            }
          });
        });
      }
    });

    return PromiseObject.create({
      promise: defer.promise
    });
  }),

  actions: {
    save() {
      this.validate().then(() => {
        if (this.datesValidated() && this.timesValidated()) {
          let combinedGroups = this.getAllLearnerGroups();

          var offering = this.get('offering');
          let promises = [];
          promises.push(offering.get('instructorGroups').then(instructorGroups => {
            let removableInstructorGroups = instructorGroups.filter(group => !this.get('buffer.instructorGroups').contains(group));
            instructorGroups.clear();
            removableInstructorGroups.forEach(group => {
              group.get('offerings').removeObject(offering);
            });
            this.get('buffer.instructorGroups').forEach(group => {
              group.get('offerings').pushObject(offering);
              instructorGroups.pushObject(group);
            });
          }));
          promises.push(offering.get('instructors').then(instructors => {
            let removableInstructors = instructors.filter(user => !this.get('buffer.instructors').contains(user));
            instructors.clear();
            removableInstructors.forEach(user => {
              user.get('offerings').removeObject(offering);
            });
            this.get('buffer.instructors').forEach(user => {
              user.get('instructedOfferings').pushObject(offering);
              instructors.pushObject(user);
            });
          }));
          promises.push(offering.get('learnerGroups').then(learnerGroups => {
            let removeableLearnerGroups = learnerGroups.filter(group => !combinedGroups.contains(group));
            learnerGroups.clear();
            removeableLearnerGroups.forEach(group => {
              group.get('offerings').removeObject(offering);
            });
            combinedGroups.forEach(group => {
              group.get('offerings').pushObject(offering);
              learnerGroups.pushObject(group);
            });
          }));

          let datesHash = this.calculateDateTimes();

          const room = this.get('buffer.room') || 'TBD';
          const startDate = datesHash.startDate.toDate();
          const endDate = datesHash.endDate.toDate();

          offering.setProperties({ room, startDate, endDate });

          promises.pushObject(offering.save());
          Ember.RSVP.all(promises).then(() => {
            if(!this.get('isDestroyed')){
              this.sendAction('save', offering);
              this.send('cancel');
            }
          });
        } else {
          this.get('flashMessages').alert('general.invalidDatetimes');
        }
      }).catch(() => {
        const roomTooLongMsg = this.get('errors.buffer.room');
        if (roomTooLongMsg) {
          this.get('flashMessages').alert(roomTooLongMsg);
        }
      });

    },
    edit() {
      let offering = this.get('offering');

      if (offering) {
        const startDate = offering.get('startDate');
        const endDate = offering.get('endDate');
        const startTime = copy(startDate);
        const endTime = copy(endDate);
        const room = offering.get('room');
        const isMultiDay = offering.get('isMultiDay');

        let buffer = Ember.Object.create({ startDate, endDate, startTime, endTime, room, isMultiDay });

        let collections = ['instructors', 'instructorGroups'];

        offering.get('learnerGroups').then((groups) => {
          groups.forEach((group) => {
            group.get('topLevelGroup').then((topLevelGroup) => {
              topLevelGroup.get('cohort').then((cohort) => {
                const groupHash = this.get('learnerGroups');

                if (groupHash[cohort.id]) {
                  groupHash[cohort.id].pushObject(group);
                } else {
                  groupHash[cohort.id] = [ group ];
                }
              });
            });
          });
        });

        let promises = collections.map(collection => {
          return offering.get(collection).then(values => {
            let arr = [];
            arr.pushObjects(values.toArray());
            buffer.set(collection, arr);
          });
        });

        all(promises).then(() => {
          this.set('buffer', buffer);
          this.set('isEditing', true);
        });
      }
    },
    cancel() {
      this.setProperties({ buffer: null, isEditing: false, learnerGroups: {} });
    },
    addInstructorGroupToBuffer(instructorGroup){
      this.get('buffer.instructorGroups').pushObject(instructorGroup);
    },
    addInstructorToBuffer(instructor){
      this.get('buffer.instructors').pushObject(instructor);
    },
    removeInstructorGroupFromBuffer(instructorGroup){
      this.get('buffer.instructorGroups').removeObject(instructorGroup);
    },
    removeInstructorFromBuffer(instructor){
      this.get('buffer.instructors').removeObject(instructor);
    },
    toggleMultiDay: function(){
      this.set('buffer.isMultiDay', !this.get('buffer.isMultiDay'));
    },
    remove: function(){
      this.sendAction('remove', this.get('offering'));
    },
    cancelRemove: function(){
      this.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(){
      this.set('showRemoveConfirmation', true);
    },

    changeStartTime(value, type) {
      let startTime = moment(this.get('buffer.startTime'));

      if (type === 'hour') {
        startTime.hour(value);
      } else {
        startTime.minute(value);
      }

      this.set('buffer.startTime', startTime.toDate());
    },

    changeEndTime(value, type) {
      let endTime = moment(this.get('buffer.endTime'));

      if (type === 'hour') {
        endTime.hour(value);
      } else {
        endTime.minute(value);
      }

      this.set('buffer.endTime', endTime.toDate());
    },

    addLearnerGroup(group, cohortId) {
      const learnerGroups = this.get('learnerGroups');

      group.get('allDescendants').then((descendants) => {
        if (isEmpty(descendants)) {
          if (learnerGroups[cohortId]) {
            learnerGroups[cohortId].addObject(group);
          } else {
            learnerGroups[cohortId] = [ group ];
          }
        } else {
          if (learnerGroups[cohortId]) {
            learnerGroups[cohortId].addObjects(descendants);
          } else {
            learnerGroups[cohortId] = descendants;
          }
        }

        this.set('changeFlag', !this.get('changeFlag'));
      });
    },

    removeLearnerGroup(group, cohortId) {
      this.get('learnerGroups')[cohortId].removeObject(group);
    },
  }
});
