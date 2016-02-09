import Ember from 'ember';
import layout from '../templates/components/session-offerings';
import { translationMacro as t } from "ember-i18n";

const { Component, computed, inject, isPresent, RSVP, copy } = Ember;
const { service } = inject;
const { alias, oneWay } = computed;
const { all } = RSVP;

export default Component.extend({
  saving: false,

  store: service(),

  i18n: service(),

  layout,

  classNames: ['session-offerings'],

  session: null,

  placeholderValue: t('sessions.titleFilterPlaceholder'),

  offerings: oneWay('session.offerings'),

  newButtonTitle: t('general.add'),

  offeringEditorOn: true,

  cohorts: alias('session.course.cohorts'),

  createSchedule(startDate, endDate, { days, numberOfWeeks }) {
    // First datetime picked by user:
    const schedule = [{ startDate, endDate }];

    const numOfWeeks = parseInt(numberOfWeeks);
    const userPickedDay = moment(startDate).day();
    const repeatedDays = schedule.slice();

    // If applicable, add time(s) for the rest of first week:
    days.forEach((day) => {
      if (day < userPickedDay) {
        repeatedDays.push({
          startDate: moment(startDate).subtract(userPickedDay - day, 'days').toDate(),
          endDate: moment(endDate).subtract(userPickedDay - day, 'days').toDate()
        });
      }

      if (userPickedDay < day) {
        const dateObj = {
          startDate: moment(startDate).add(day - userPickedDay, 'days').toDate(),
          endDate: moment(endDate).add(day - userPickedDay, 'days').toDate()
        };

        repeatedDays.push(dateObj);
        schedule.push(dateObj);
      }
    });

    // Implement schedule for next n weeks:
    let counter = 7;

    for (let i = 0; i < numOfWeeks; i++) {
      repeatedDays.forEach(({ startDate, endDate }) => {
        schedule.push({
          startDate: moment(startDate).add(counter, 'days').toDate(),
          endDate: moment(endDate).add(counter, 'days').toDate()
        });
      });

      counter += 7;
    }

    return schedule;
  },

  actions: {
    addSingleOffering({ startDate, endDate, room, learnerGroups, instructors, instructorGroups }) {
      const store = this.get('store');
      const session = this.get('session');
      let offering = store.createRecord('offering', { session, startDate, endDate, room, learnerGroups, instructors, instructorGroups });

      offering.save().then((offering) => {
        offering.get('learnerGroups').then((offeringlearnerGroups) => {
          learnerGroups.forEach((learnerGroup) => {
            offeringlearnerGroups.pushObject(learnerGroup);
          });
        });

        if (isPresent(instructors)) {
          offering.get('instructors').then((offeringInstructors) => {
            offeringInstructors.pushObjects(instructors);
          });
        }

        if (isPresent(instructorGroups)) {
          offering.get('instructorGroups').then((offeringInstructorGroups) => {
            offeringInstructorGroups.pushObjects(instructorGroups);
          });
        }
      });
    },

    addMultipleOfferings({ learnerGroups, startDate: sharedStartDateObj, endDate: sharedEndDateObj }) {
      this.set('saving', true);

      const store = this.get('store');
      const session = this.get('session');
      let offeringPromises = [];

      learnerGroups.forEach((learnerGroup) => {
        const room = learnerGroup.get('location') || 'TBD';
        const startDate = copy(sharedStartDateObj);
        const endDate = copy(sharedEndDateObj);
        let learnerGroups = [ learnerGroup ];
        let offering = store.createRecord('offering', { session, startDate, endDate, room, learnerGroups });

        offeringPromises.pushObject(offering.save());
      });

      all(offeringPromises).then((offerings) => {
        let promises = [];

        learnerGroups.forEach((learnerGroup, index) => {
          let promise1 = offerings[index].get('learnerGroups').then((offeringLearnerGroups) => {
            offeringLearnerGroups.pushObject(learnerGroup);
          });
          promises.pushObject(promise1);

          learnerGroup.get('instructors').then((defaultInstructors) => {
            if (isPresent(defaultInstructors)) {
              let promise2 = offerings[index].get('instructors').then((offeringInstructors) => {
                offeringInstructors.pushObjects(defaultInstructors);
              });
              promises.pushObject(promise2);
            }
          });

          learnerGroup.get('instructorGroups').then((defaultInstructorGroups) => {
            if (isPresent(defaultInstructorGroups)) {
              let promise3 = offerings[index].get('instructorGroups').then((offeringInstructorGroups) => {
                offeringInstructorGroups.pushObjects(defaultInstructorGroups);
              });
              promises.pushObject(promise3);
            }
          });
        });

        all(promises).then(() => {
          this.set('saving', false);
        });
      });

      // MORE ELEGANT SOLUTION (FIX POLYMORPHIC RELATIONSHIP ERROR):
      //
      // const promises = learnerGroups.map((learnerGroup) => {
      //   const room = learnerGroup.get('location');
      //   const offering = store.createRecord('offering', { session, startDate, endDate, room });
      //   const offeringPromise = offering.save();
      //
      //   const learnerGroupsPromise = offeringPromise.then(() => {
      //       return offering.get('learnerGroups');
      //     })
      //     .then((groups) => {
      //       groups.pushObject('learnerGroup');
      //     });
      //
      //   const instructorsPromise = offeringPromise.then(() => {
      //       const instructors = offering.get('instructors');
      //       const defaultInstructors = learnerGroup.get('instructorUsers');
      //
      //       return hash({ instructors, defaultInstructors });
      //     })
      //     .then(({ instructors, defaultInstructors }) => {
      //       if (isPresent(defaultInstructors)) {
      //         instructors.pushObjects(defaultInstructors);
      //       }
      //     });
      //
      //   return all([ learnerGroupsPromise, instructorsPromise ]).then(() => {
      //     return offering.save();
      //   })
      // });
      //
      // all(promises).finally(() => {
      //   this.set('saving', false);
      // });
    },

    addSingleOfferingRecurring({ startDate, endDate, room, learnerGroups, instructors, instructorGroups, recurringOptions }) {
      this.set('saving', true);

      const store = this.get('store');
      const session = this.get('session');
      const schedule = this.createSchedule(startDate, endDate, recurringOptions);
      const offeringPromises = [];

      schedule.forEach(({ startDate, endDate }) => {
        let offering = store.createRecord('offering', { session, startDate, endDate, room, learnerGroups, instructors, instructorGroups });

        let promise = offering.save().then((offering) => {
          offering.get('learnerGroups').then((offeringlearnerGroups) => {
            learnerGroups.forEach((learnerGroup) => {
              offeringlearnerGroups.pushObject(learnerGroup);
            });
          });

          if (isPresent(instructors)) {
            offering.get('instructors').then((offeringInstructors) => {
              offeringInstructors.pushObjects(instructors);
            });
          }

          if (isPresent(instructorGroups)) {
            offering.get('instructorGroups').then((offeringInstructorGroups) => {
              offeringInstructorGroups.pushObjects(instructorGroups);
            });
          }
        });

        offeringPromises.pushObject(promise);
      });

      all(offeringPromises).finally(() => {
        this.set('saving', false);
      });
    },

    addMultipleOfferingsRecurring({ learnerGroups, startDate: sharedStartDateObj, endDate: sharedEndDateObj, recurringOptions }) {
      this.set('saving', true);

      const store = this.get('store');
      const session = this.get('session');
      const schedule = this.createSchedule(sharedStartDateObj, sharedEndDateObj, recurringOptions);
      const offeringPromises = [];

      learnerGroups.forEach((learnerGroup) => {
        const room = learnerGroup.get('location') || 'TBD';
        const startDate = copy(sharedStartDateObj);
        const endDate = copy(sharedEndDateObj);
        const lgs = [ learnerGroup ];

        schedule.forEach(({ startDate, endDate }) => {
          let offering = store.createRecord('offering', { session, startDate, endDate, room, learnerGroups: lgs });

          offeringPromises.pushObject(offering.save());
        });
      });

      all(offeringPromises).then((offerings) => {
        let promises = [];

        // Need to straighten out this area.
        learnerGroups.forEach((learnerGroup, index) => {
          let promise1 = offerings[index].get('learnerGroups').then((offeringLearnerGroups) => {
            offeringLearnerGroups.pushObject(learnerGroup);
          });
          promises.pushObject(promise1);

          learnerGroup.get('instructors').then((defaultInstructors) => {
            if (isPresent(defaultInstructors)) {
              let promise2 = offerings[index].get('instructors').then((offeringInstructors) => {
                offeringInstructors.pushObjects(defaultInstructors);
              });
              promises.pushObject(promise2);
            }
          });

          learnerGroup.get('instructorGroups').then((defaultInstructorGroups) => {
            if (isPresent(defaultInstructorGroups)) {
              let promise3 = offerings[index].get('instructorGroups').then((offeringInstructorGroups) => {
                offeringInstructorGroups.pushObjects(defaultInstructorGroups);
              });
              promises.pushObject(promise3);
            }
          });
        });

        all(promises).then(() => {
          this.set('saving', false);
        });
      });
    },

    toggleEditor() {
      this.set('offeringEditorOn', !this.get('offeringEditorOn'));
    },

    closeEditor() {
      this.set('offeringEditorOn', false);
    }
  }
});
