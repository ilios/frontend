import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';

export default class ProgramyearListComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @service store;
  @service iliosConfig;

  @tracked editorOn = false;
  @tracked itemsToSave = 100;
  @tracked saved = false;
  @tracked savedItems;
  @tracked savedProgramYear;
  @tracked availableAcademicYears = [];
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  get sortedContent() {
    if (! this.args.programYears) {
      return [];
    }
    return this.args.programYears.toArray().sortBy('academicYear');
  }

  get proxiedProgramYears() {
    const permissionChecker = this.permissionChecker;
    const currentUser = this.currentUser;
    return this.sortedContent.map(programYear => {
      return ProgramYearProxy.create({
        content: programYear,
        currentUser,
        permissionChecker,
        academicYearCrossesCalendarYearBoundaries: this.academicYearCrossesCalendarYearBoundaries
      });
    });
  }

  @restartableTask
  *load() {
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
  }

  @action
  toggleEditor() {
    if (this.editorOn) {
      this.args.cancel();
    } else {
      this.editorOn = true;
      this.saved = false;
    }
  }

  @action
  cancel() {
    this.editorOn = false;
  }

  @action
  remove(programYearProxy) {
    programYearProxy.set('showRemoveConfirmation', true);
  }

  @action
  confirmRemove(programYearProxy) {
    const programYear = programYearProxy.get('content');
    programYear.deleteRecord();
    programYear.save();
  }

  @action
  cancelRemove(programYearProxy) {
    programYearProxy.set('showRemoveConfirmation', false);
  }

  @action
  async unlockProgramYear(programYearProxy) {
    const canUnlock = await programYearProxy.get('userCanUnLock');
    if (canUnlock) {
      programYearProxy.set('isSaving', true);
      await this.args.unlock(programYearProxy.get('content'));
      programYearProxy.set('isSaving', false);
    }
  }

  @action
  async lockProgramYear(programYearProxy) {
    const canLock = await programYearProxy.get('userCanLock');
    if (canLock) {
      programYearProxy.set('isSaving', true);
      await this.args.lock(programYearProxy.get('content'));
      programYearProxy.set('isSaving', false);
    }
  }

  resetSaveItems() {
    this.itemsToSave = 100;
    this.savedItems = 0;
  }

  incrementSavedItems() {
    this.savedItems = this.savedItems + 1;
  }

  @dropTask
  *save(startYear) {
    const programYears = this.sortedContent;
    const latestProgramYear = programYears.get('lastObject');
    const program = this.args.program;
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

      newProgramYear.directors.pushObjects(directors.toArray());
      newProgramYear.competencies.pushObjects(competencies.toArray());
      newProgramYear.terms.pushObjects(terms.toArray());
    }
    const savedProgramYear = yield newProgramYear.save();
    itemsToSave++;
    this.incrementSavedItems();

    if (latestProgramYear) {
      const relatedObjectives = yield latestProgramYear.programYearObjectives;
      const programYearObjectives = relatedObjectives.sortBy('id').toArray();
      itemsToSave += programYearObjectives.length;
      this.itemsToSave = itemsToSave;

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
    this.itemsToSave = itemsToSave;
    this.saved = true;
    this.savedProgramYear = newProgramYear;
    this.cancel();
  }
}

// @todo convert this into a component. [ST 2021/02/22]
const ProgramYearProxy = ObjectProxy.extend({
  content: null,
  currentUser: null,
  isSaving: false,
  permissionChecker: null,
  showRemoveConfirmation: false,
  academicYearCrossesCalendarYearBoundaries: false,

  academicYear: computed('content', 'academicYearCrossesCalendarYearBoundaries', function() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.content.startYear + ' - ' + (parseInt(this.content.startYear, 10) + 1);
    }
    return this.content.startYear;
  }),

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
