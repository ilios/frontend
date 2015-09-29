import moment from 'moment';
import Ember from 'ember';
import layout from '../templates/components/session-offerings';
import { translationMacro as t } from "ember-i18n";

const { Component, computed, inject, isPresent, RSVP } = Ember;
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

  offeringEditorOn: false,

  cohorts: alias('session.course.cohorts'),

  actions: {
    addSingleOffering({ startDate, endDate, room, learnerGroups, instructors, instructorGroups }) {
      const store = this.get('store');
      const session = this.get('session');
      const offering = store.createRecord('offering', { session, startDate, endDate, room });

      offering.save().then((offering) => {
        offering.get('learnerGroups').then((offeringlearnerGroups) => {
          learnerGroups.forEach((learnerGroup) => {
            offeringlearnerGroups.pushObject(learnerGroup);
            learnerGroup.save();
          });
        });

        if (isPresent(instructors)) {
          offering.get('instructors').then((offeringInstructors) => {
            offeringInstructors.pushObjects(instructors);
            offeringInstructors.save();
          });
        }

        if (isPresent(instructorGroups)) {
          offering.get('instructorGroups').then((offeringInstructorGroups) => {
            offeringInstructorGroups.pushObjects(instructorGroups);
            offeringInstructorGroups.save();
          });
        }
      });
    },

    addMultipleOfferings({ learnerGroups, startDate, endDate }) {
      this.set('saving', true);

      const store = this.get('store');
      const session = this.get('session');
      const offeringPromises = [];

      learnerGroups.forEach((learnerGroup) => {
        const room = learnerGroup.get('location');
        const offering = store.createRecord('offering', { session, startDate, endDate, room });

        offeringPromises.pushObject(offering.save());
      });

      all(offeringPromises).then((offerings) => {
        let promises = [];

        learnerGroups.forEach((learnerGroup, index) => {
          offerings[index].get('learnerGroups').then((offeringLearnerGroups) => {
            offeringLearnerGroups.pushObject(learnerGroup);
            promises.pushObject(learnerGroup.save());
          });

          learnerGroup.get('instructorUsers').then((defaultInstructors) => {
            if (isPresent(defaultInstructors)) {
              offerings[index].get('instructors').then((offeringInstructors) => {
                offeringInstructors.pushObjects(defaultInstructors);
                promises.pushObjects(offeringInstructors.save());
              });
            }
          });

          learnerGroup.get('instructorGroups').then((defaultInstructorGroups) => {
            if (isPresent(defaultInstructorGroups)) {
              offerings[index].get('instructorGroups').then((offeringInstructorGroups) => {
                offeringInstructorGroups.pushObjects(defaultInstructorGroups);
                promises.pushObjects(offeringInstructorGroups.save());
              });
            }
          });
        });

        all(promises).finally(() => {
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

    toggleEditor() {
      this.set('offeringEditorOn', !this.get('offeringEditorOn'));
    },

    closeEditor() {
      this.set('offeringEditorOn', false);
    }
  }
});
