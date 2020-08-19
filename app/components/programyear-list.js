import Component from '@ember/component';
import { computed } from '@ember/object';
import { mapBy } from '@ember/object/computed';
import ObjectProxy from '@ember/object/proxy';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import moment from 'moment';

export default Component.extend({
  currentUser: service(),
  permissionChecker: service(),

  store: service(),

  tagName: "",
  canCreate: false,
  editorOn: false,
  itemsToSave: null,
  program: null,
  programYears: null,
  saved: false,
  savedItems: null,
  savedProgramYear: null,

  existingStartYears: mapBy('programYears', 'startYear'),

  sortedContent: computed('programYears.[]', async function() {
    const programYears = await this.programYears;
    if (isEmpty(programYears)) {
      return [];
    }
    return programYears.toArray().sortBy('academicYear');
  }),

  proxiedProgramYears: computed('sortedContent.[]', async function() {
    const permissionChecker = this.permissionChecker;
    const currentUser = this.currentUser;
    const programYears = await this.sortedContent;
    return programYears.map(programYear => {
      return ProgramYearProxy.create({
        content: programYear,
        currentUser,
        permissionChecker
      });
    });
  }),

  availableAcademicYears: computed('existingStartYears.[]', {
    get() {
      const firstYear = parseInt(moment().subtract(5, 'years').format('YYYY'), 10);
      const years = [];

      for (let i = 0; i < 10; i++) {
        years.pushObject(firstYear + i);
      }

      return years.filter((year) => {
        return !this.existingStartYears.includes(year.toString());
      }).map((startYear) => {
        return { label: `${startYear} - ${startYear + 1}`, value: startYear };
      });
    }
  }).readOnly(),

  actions: {
    toggleEditor() {
      if (this.editorOn) {
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

    unlockProgramYear(programYearProxy) {
      programYearProxy.get('userCanUnLock').then(permission => {
        if (permission) {
          run(()=>{
            programYearProxy.set('isSaving', true);
          });
          this.unlock(programYearProxy.get('content')).then(()=>{
            programYearProxy.set('isSaving', false);
          });
        }
      });
    },

    lockProgramYear(programYearProxy) {
      programYearProxy.get('userCanLock').then(permission => {
        if (permission) {
          run(()=>{
            programYearProxy.set('isSaving', true);
          });
          this.lock(programYearProxy.get('content')).then(()=>{
            programYearProxy.set('isSaving', false);
          });
        }
      });
    },
  },

  resetSaveItems() {
    this.set('itemsToSave', 100);
    this.set('savedItems', 0);
  },

  incrementSavedItems() {
    this.set('savedItems', this.savedItems + 1);
  },

  save: task(function* (startYear) {
    const programYears = yield this.sortedContent;
    const latestProgramYear = programYears.get('lastObject');
    const program = this.program;
    const store = this.store;
    let itemsToSave = 0;
    this.resetSaveItems();

    const newProgramYear = store.createRecord('program-year', {
      program,
      startYear,
    });
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

      newProgramYear.get('directors').pushObjects(directors.toArray());
      newProgramYear.get('competencies').pushObjects(competencies.toArray());
      newProgramYear.get('terms').pushObjects(terms.toArray());
    }
    const savedProgramYear = yield newProgramYear.save();
    itemsToSave++;
    this.incrementSavedItems();

    if (latestProgramYear) {
      const relatedObjectives = yield latestProgramYear.get('programYearObjectives');
      const programYearObjectives = relatedObjectives.sortBy('id').toArray();
      itemsToSave += programYearObjectives.length;
      this.set('itemsToSave', itemsToSave);

      for (let i = 0; i < programYearObjectives.length; i++) {
        const programYearObjectiveToCopy = programYearObjectives[i];
        const terms = yield programYearObjectiveToCopy.terms;
        const meshDescriptors = yield programYearObjectiveToCopy.meshDescriptors;
        const competency = yield programYearObjectiveToCopy.competency;
        let ancestor = yield programYearObjectiveToCopy.ancestor;

        if (isEmpty(ancestor)) {
          ancestor = programYearObjectiveToCopy;
        }

        const newProgramYearObjective = store.createRecord('program-year-objective', {
          position: programYearObjectiveToCopy.position,
          programYear: savedProgramYear,
          title: programYearObjectiveToCopy.title,
          ancestor,
          meshDescriptors,
          competency,
          terms
        });
        yield newProgramYearObjective.save();
        this.incrementSavedItems();
      }
    }
    this.set('itemsToSave', itemsToSave);
    this.setProperties({ saved: true, savedProgramYear: newProgramYear });
    this.send('cancel');
  }).drop()
});

const ProgramYearProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  isSaving: false,
  permissionChecker: null,
  showRemoveConfirmation: false,

  userCanDelete: computed('content', 'currentUser.model.programYears.[]', async function() {
    const programYear = this.content;
    const permissionChecker = this.permissionChecker;
    const cohort = await programYear.get('cohort');
    const cohortUsers = cohort.hasMany('users').ids();
    if (cohortUsers.length > 0) {
      return false;
    }
    return permissionChecker.canDeleteProgramYear(programYear);
  }),

  userCanLock: computed('content', 'currentUser.model.programYears.[]', async function() {
    const programYear = this.content;
    const permissionChecker = this.permissionChecker;
    return permissionChecker.canLockProgramYear(programYear);
  }),

  userCanUnLock: computed('content', 'currentUser.model.programYears.[]', async function() {
    const programYear = this.content;
    const permissionChecker = this.permissionChecker;
    return permissionChecker.canUnlockProgramYear(programYear);
  }),
});
