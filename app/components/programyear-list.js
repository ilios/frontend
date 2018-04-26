/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { hash } from 'rsvp';
import { run } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import { task } from 'ember-concurrency';

const { mapBy } = computed;

export default Component.extend({
  classNames: ['programyear-list'],

  store: service(),
  currentUser: service(),
  permissionChecker: service(),

  program: null,
  programYears: null,
  canCreate: false,

  sortedContent: computed('programYears.[]', async function() {
    const programYears = await this.get('programYears');
    if (isEmpty(programYears)) {
      return [];
    }
    return programYears.toArray().sortBy('academicYear');
  }),

  proxiedProgramYears: computed('sortedContent.[]', async function(){
    const permissionChecker = this.get('permissionChecker');
    const currentUser = this.get('currentUser');
    const programYears = await this.get('sortedContent');
    return programYears.map(programYear => {
      return ProgramYearProxy.create({
        content: programYear,
        currentUser,
        permissionChecker
      });
    });
  }),

  existingStartYears: mapBy('programYears', 'startYear'),

  availableAcademicYears: computed('existingStartYears.[]', {
    get() {
      let firstYear = parseInt(moment().subtract(5, 'years').format('YYYY'), 10);
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
    const programYears = yield this.get('sortedContent');
    const latestProgramYear = programYears.get('lastObject');
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
  permissionChecker: null,
  showRemoveConfirmation: false,
  isSaving: false,
  userCanDelete: computed('content', 'currentUser.model.programYears.[]', async function(){
    const programYear = this.get('content');
    const permissionChecker = this.get('permissionChecker');
    if (programYear.get('isPublishedOrScheduled')) {
      return false;
    }
    const cohort = await programYear.get('cohort');
    const cohortUsers = cohort.hasMany('users').ids();
    if (cohortUsers.length > 0) {
      return false;
    }
    return permissionChecker.canDeleteProgramYear(programYear);
  }),
  userCanLock: computed('content', 'currentUser.model.programYears.[]', async function(){
    const programYear = this.get('content');
    const permissionChecker = this.get('permissionChecker');
    return permissionChecker.canUpdateProgramYear(programYear);
  }),
  userCanUnLock: computed('content', 'currentUser.model.programYears.[]', async function(){
    const programYear = this.get('content');
    const permissionChecker = this.get('permissionChecker');
    return permissionChecker.canUnlockProgramYear(programYear);
  }),
});
