import moment from 'moment';
import Ember from 'ember';

const { Component, computed, inject, ObjectProxy, RSVP } = Ember;
const { service } = inject;
const { mapBy, sort } = computed;
const { all } = RSVP;

export default Component.extend({
  classNames: ['detail-view', 'programyear-list'],

  store: service(),
  i18n: service(),

  program: null,
  programYears: [],

  sortBy: ['academicYear'],
  sortedContent: sort('programYears', 'sortBy'),
  proxiedProgramYears: computed('sortedContent.[]', {
    get() {
      const content = this.get('sortedContent');

      return content.map((programYear) => {
        return ObjectProxy.create({
          content: programYear,
          showRemoveConfirmation: false
        });
      });
    }
  }),

  existingStartYears: mapBy('programYears', 'startYear'),

  availableAcademicYears: computed('existingStartYears.[]', {
    get() {
      let firstYear = parseInt(moment().subtract(5, 'years').format('YYYY'));
      let years = [];

      for (let i = 0; i < 10; i++) {
        years.pushObject(firstYear + i);
      }

      return years.filter((year) => {
        return !this.get('existingStartYears').contains(year.toString());
      }).map((startYear) => {
        return { label: `${startYear} - ${startYear + 1}`, value: startYear };
      });
    }
  }).readOnly(),

  editorOn: false,

  saved: false,
  savedProgramYear: null,

  actions: {
    toggleEditor() {
      if (this.get('editorOn')) {
        this.send('cancel');
      } else {
        this.setProperties({ editorOn: true, saved: false });
      }
    },

    cancel() {
      this.set('editorOn', false);
    },

    save(startYear) {
      const component = this;
      const latestProgramYear = this.get('sortedContent').get('lastObject');
      const program = this.get('program');
      const store = this.get('store');

      let newProgramYear = store.createRecord('program-year', { program, startYear });
      let promises = [];

      if (latestProgramYear) {
        promises.pushObject(latestProgramYear.get('directors').then((directors) => {
          newProgramYear.get('directors').pushObjects(directors.toArray());
        }));
        promises.pushObject(latestProgramYear.get('competencies').then((competencies) => {
          newProgramYear.get('competencies').pushObjects(competencies.toArray());
        }));
        promises.pushObject(latestProgramYear.get('topics').then((topics) => {
          newProgramYear.get('topics').pushObjects(topics.toArray());
        }));
        promises.pushObject(latestProgramYear.get('objectives').then((objectives) => {
          newProgramYear.get('objectives').pushObjects(objectives.toArray());
        }));
        promises.pushObject(latestProgramYear.get('stewards').then((stewards) => {
          newProgramYear.get('stewards').pushObjects(stewards.toArray());
        }));
      }

      all(promises).then(() => {
        newProgramYear.save().then((savedProgramYear) => {
          const store = component.get('store');
          let promises = [];

          promises.pushObject(program.get('programYears').then((programYears) => {
            programYears.addObject(savedProgramYear);
          }));

          const classOfYear = savedProgramYear.get('classOfYear');
          const title = component.get('i18n').t('general.classOf', { year: classOfYear });

          let cohort = store.createRecord('cohort', { programYear: savedProgramYear, title });

          promises.pushObject(cohort.save());

          all(promises).then(() => {
            component.setProperties({ saved: true, savedProgramYear: newProgramYear });
            component.send('cancel');
          });
        });
      });
    },

    remove(programYearProxy) {
      programYearProxy.set('showRemoveConfirmation', true);
    },

    confirmRemove(programYearProxy) {
      programYearProxy.get('content').destroyRecord();
    },

    cancelRemove(programYearProxy) {
      programYearProxy.set('showRemoveConfirmation', false);
    }
  }
});
