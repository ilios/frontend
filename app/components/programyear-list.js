import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import RSVP from 'rsvp';
import { run } from '@ember/runloop';
import { isEmpty, isPresent } from '@ember/utils';
import moment from 'moment';
import { task } from 'ember-concurrency';

const { mapBy, sort } = computed;
const { Promise, hash } = RSVP;

export default Component.extend({
  classNames: ['programyear-list'],

  store: service(),
  currentUser: service(),

  program: null,
  programYears: [],

  sortBy: ['academicYear'],
  sortedContent: sort('programYears', 'sortBy'),
  proxiedProgramYears: computed('sortedContent.[]', function(){
    const currentUser = this.get('currentUser');
    return this.get('sortedContent').map(programYear => {
      return ProgramYearProxy.create({
        content: programYear,
        currentUser
      });
    });
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
        return !this.get('existingStartYears').includes(year.toString());
      }).map((startYear) => {
        return { label: `${startYear} - ${startYear + 1}`, value: startYear };
      });
    }
  }).readOnly(),

  editorOn: false,

  saved: false,
  savedProgramYear: null,
  itemsToSave: null,
  savedItems: null,

  resetSaveItems(){
    this.set('itemsToSave', 100);
    this.set('savedItems', 0);
  },

  incrementSavedItems(){
    this.set('savedItems', this.get('savedItems') + 1);
  },

  save: task(function * (startYear){
    const latestProgramYear = this.get('sortedContent').get('lastObject');
    const program = this.get('program');
    const store = this.get('store');
    let itemsToSave = 0;
    this.resetSaveItems();

    let newProgramYear = store.createRecord('program-year', { program, startYear });
    this.incrementSavedItems();

    if (latestProgramYear) {
      const directors = yield latestProgramYear.get('directors');
      itemsToSave++;
      this.incrementSavedItems();
      const competencies = yield latestProgramYear.get('competencies');
      itemsToSave++;
      this.incrementSavedItems();
      const terms = yield latestProgramYear.get('terms');
      itemsToSave++;
      this.incrementSavedItems();
      const stewards = yield latestProgramYear.get('stewards');
      itemsToSave++;
      this.incrementSavedItems();

      newProgramYear.get('directors').pushObjects(directors.toArray());
      newProgramYear.get('competencies').pushObjects(competencies.toArray());
      newProgramYear.get('terms').pushObjects(terms.toArray());
      newProgramYear.get('stewards').pushObjects(stewards.toArray());
    }
    let savedProgramYear = yield newProgramYear.save();
    itemsToSave++;
    this.incrementSavedItems();

    if (latestProgramYear) {
      const relatedObjectives = yield latestProgramYear.get('objectives');
      const objectives = relatedObjectives.sortBy('id').toArray();
      itemsToSave += objectives.length;
      this.set('itemsToSave', itemsToSave);

      for (let i = 0; i < objectives.length; i++) {
        let objectiveToCopy = objectives[i];
        let ancestor = yield objectiveToCopy.get('ancestor');
        if (isEmpty(ancestor)) {
          ancestor = objectiveToCopy;
        }
        let newObjective = store.createRecord('objective', objectiveToCopy.getProperties(['title', 'position']));
        let props = yield hash(objectiveToCopy.getProperties('meshDescriptors', 'competency'));
        newObjective.setProperties(props);
        newObjective.set('programYears', [savedProgramYear]);
        newObjective.set('ancestor', ancestor);
        yield newObjective.save();
        this.incrementSavedItems();
      }
    }
    this.set('itemsToSave', itemsToSave);
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
    },
    unlockProgramYear(programYearProxy){
      programYearProxy.get('userCanUnLock').then(permission => {
        if (permission) {
          run(()=>{
            programYearProxy.set('isSaving', true);
          });
          this.get('unlock')(programYearProxy.get('content')).then(()=>{
            programYearProxy.set('isSaving', false);
          });
        }
      });
    },
    lockProgramYear(programYearProxy){
      programYearProxy.get('userCanLock').then(permission => {
        if (permission) {
          run(()=>{
            programYearProxy.set('isSaving', true);
          });
          this.get('lock')(programYearProxy.get('content')).then(()=>{
            programYearProxy.set('isSaving', false);
          });
        }
      });
    },
  }
});


const ProgramYearProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  showRemoveConfirmation: false,
  isSaving: false,
  userCanDelete: computed('content', 'currentUser.userIsDeveloper', 'currentUser.model.programYears.[]', function(){
    return new Promise(resolve => {
      const programYear = this.get('content');
      const currentUser = this.get('currentUser');
      if (programYear.get('isPublishedOrScheduled')) {
        resolve(false);
        return;
      }
      currentUser.get('userIsDeveloper').then(isDeveloper => {
        if (! isDeveloper) {
          resolve(false);
          return;
        }
        programYear.get('cohort').then(cohort => {
          if (! isPresent(cohort)) {
            resolve(false);
            return;
          }
          cohort.get('users').then(users => {
            resolve(0 === users.length);
          });
        });
      });
    });
  }),
  userCanLock: computed('content', 'currentUser.userIsDeveloper', 'currentUser.model.programYears.[]', function(){
    return new Promise(resolve => {
      const currentUser = this.get('currentUser');
      currentUser.get('userIsDeveloper').then(isDeveloper => {
        resolve(isDeveloper);
      });
    });
  }),
  userCanUnLock: computed('content', 'currentUser.userIsDeveloper', 'currentUser.model.programYears.[]', function(){
    return new Promise(resolve => {
      const currentUser = this.get('currentUser');
      currentUser.get('userIsDeveloper').then(isDeveloper => {
        resolve(isDeveloper);
      });
    });
  }),
});
