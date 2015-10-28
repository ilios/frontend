import moment from 'moment';
import Ember from 'ember';

const { Component, computed, inject, RSVP } = Ember;
const { service } = inject;
const { mapBy, sort } = computed;
const { all } = RSVP;

export default Component.extend({
  classNames: ['detail-view', 'programyear-list'],

  store: service(),

  i18n: service(),
  placeholder: computed('i18n.locale', function() {
    return this.get('i18n').t('programs.selectAcademicYear');
  }),

  program: null,
  programYears: [],

  sortBy: ['academicYear'],
  sortedContent: sort('programYears', 'sortBy'),

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

  selection: null,

  actions: {
    toggleEditor() {
      if (this.get('editorOn')) {
        this.send('cancel');
      } else {
        this.set('editorOn', true);
      }
    },

    changeSelection(value) {
      this.set('selection', value);
    },

    cancel() {
      this.setProperties({ editorOn: false, selection: null });
    },

    save() {
      const component = this;
      const latestProgramYear = this.get('sortedContent').get('lastObject');
      const startYear = this.get('selection.value');
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

          let cohort = store.createRecord('cohort', {
            programYear: savedProgramYear
          });

          promises.pushObject(cohort.save());

          all(promises).then(() => {
            program.save().then(() => {
              component.send('cancel');
            });
          });
        });
      });
    },

    remove(programYear) {
      programYear.destroyRecord();
    }
  }
});
