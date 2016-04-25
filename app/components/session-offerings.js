import Ember from 'ember';
import layout from '../templates/components/session-offerings';
import { translationMacro as t } from "ember-i18n";
import moment from 'moment';

const { Component, computed, inject, RSVP, copy } = Ember;
const { service } = inject;
const { alias, oneWay } = computed;
const { all, hash } = RSVP;

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

    // Implement schedule for next n-1 weeks:
    let counter = 7;

    for (let i = 1; i < numOfWeeks; i++) {
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

  returnSingleOfferingPromise({ startDate, endDate, room, site, learnerGroups, instructors, instructorGroups }) {
    const store = this.get('store');
    const session = this.get('session');

    let offering = store.createRecord('offering', { session, startDate, endDate, room, site, learnerGroups, instructors, instructorGroups });

    return offering.save();
  },

  actions: {
    addSingleOffering(params) {
      this.returnSingleOfferingPromise(params);
    },

    addMultipleOfferings({ learnerGroups, startDate: sharedStartDateObj, endDate: sharedEndDateObj }) {
      this.set('saving', true);

      let offeringPromises = [];

      learnerGroups.forEach((learnerGroup) => {
        const room = learnerGroup.get('location') || 'TBD';
        const site = null;
        const startDate = copy(sharedStartDateObj);
        const endDate = copy(sharedEndDateObj);
        const learnerGroups = [ learnerGroup ];
        const instructors = learnerGroup.get('instructors');
        const instructorGroups = learnerGroup.get('instructorGroups');

        let promise = hash({ room, site, startDate, endDate, learnerGroups, instructors, instructorGroups });

        offeringPromises.pushObject(promise);
      });

      all(offeringPromises).then((offeringParams) => {
        let promises = [];

        offeringParams.forEach((params) => {
          promises.pushObject(this.returnSingleOfferingPromise(params));
        });

        all(promises).then(() => {
          this.set('saving', false)
        });
      });
    },

    addSingleOfferingRecurring(params) {
      this.set('saving', true);

      const schedule = this.createSchedule(params.startDate, params.endDate, params.recurringOptions);
      const offeringPromises = [];

      schedule.forEach(({ startDate, endDate }) => {
        params.startDate = startDate;
        params.endDate = endDate;

        offeringPromises.pushObject(this.returnSingleOfferingPromise(params));
      });

      all(offeringPromises).then(() => {
        this.set('saving', false);
      });
    },

    addMultipleOfferingsRecurring({ learnerGroups, startDate: sharedStartDateObj, endDate: sharedEndDateObj, recurringOptions }) {
      this.set('saving', true);

      const schedule = this.createSchedule(sharedStartDateObj, sharedEndDateObj, recurringOptions);
      const offeringPromises = [];

      learnerGroups.forEach((learnerGroup) => {
        const room = learnerGroup.get('location') || 'TBD'
        const site = null;
        const learnerGroups = [ learnerGroup ];
        const instructors = learnerGroup.get('instructors');
        const instructorGroups = learnerGroup.get('instructorGroups');

        schedule.forEach(({ startDate, endDate }) => {
          let promise = hash({ room, site, startDate, endDate, learnerGroups, instructors, instructorGroups });

          offeringPromises.pushObject(promise);
        });
      });

      all(offeringPromises).then((offeringParams) => {
        let promises = [];

        offeringParams.forEach((params) => {
          promises.pushObject(this.returnSingleOfferingPromise(params));
        });

        all(promises).then(() => {
          this.set('saving', false)
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
