import moment from 'moment';
import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, computed, inject, ObjectProxy, RSVP } = Ember;
const { service } = inject;
const { mapBy, sort } = computed;
const { hash } = RSVP;

export default Component.extend({
  classNames: ['programyear-list'],

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

  save: task(function * (startYear){
    const latestProgramYear = this.get('sortedContent').get('lastObject');
    const program = this.get('program');
    const store = this.get('store');
    const i18n = this.get('i18n');

    let newProgramYear = store.createRecord('program-year', { program, startYear });

    if (latestProgramYear) {
      const directors = yield latestProgramYear.get('directors');
      const competencies = yield latestProgramYear.get('competencies');
      const terms = yield latestProgramYear.get('terms');
      const stewards = yield latestProgramYear.get('stewards');

      newProgramYear.get('directors').pushObjects(directors.toArray());
      newProgramYear.get('competencies').pushObjects(competencies.toArray());
      newProgramYear.get('terms').pushObjects(terms.toArray());
      newProgramYear.get('stewards').pushObjects(stewards.toArray());
    }
    let savedProgramYear = yield newProgramYear.save();

    if (latestProgramYear) {
      const relatedObjectives = yield latestProgramYear.get('objectives');
      const objectives = relatedObjectives.sortBy('id').toArray();
      for (let i = 0; i < objectives.length; i++) {
        let objectiveToCopy = objectives[i];
        let newObjective = store.createRecord(
          'objective',
          objectiveToCopy.getProperties('title')
        );
        let props = yield hash(objectiveToCopy.getProperties('meshDescriptors', 'competency'));
        newObjective.setProperties(props);
        newObjective.set('programYears', [savedProgramYear]);
        yield newObjective.save();
      }
    }

    const classOfYear = savedProgramYear.get('classOfYear');
    const title = i18n.t('general.classOf', { year: classOfYear });

    let cohort = store.createRecord('cohort', { programYear: savedProgramYear, title });
    yield cohort.save();
    this.setProperties({ saved: true, savedProgramYear: newProgramYear });
    this.send('cancel');
  }).drop(),

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

    remove(programYearProxy) {
      programYearProxy.set('showRemoveConfirmation', true);
    },

    confirmRemove(programYearProxy) {
      const programYear = programYearProxy.get('content');
      programYear.deleteRecord();
      programYear.save();
    },

    cancelRemove(programYearProxy) {
      programYearProxy.set('showRemoveConfirmation', false);
    }
  }
});
