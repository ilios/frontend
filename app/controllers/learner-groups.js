/* eslint ember/order-in-controllers: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { isBlank, isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import cloneLearnerGroup from '../utils/clone-learner-group';

export default Controller.extend({
  currentUser: service(),
  permissionChecker: service(),
  intl: service(),
  store: service(),

  queryParams: {
    schoolId: 'school',
    programId: 'program',
    programYearId: 'programYear',
    titleFilter: 'filter',
  },

  schoolId: null,
  programId: null,
  programYearId: null,
  titleFilter: null,
  deletedGroup: null,
  newGroup: null,
  totalGroupsToSave: 0,
  currentGroupsSaved: 0,
  showNewLearnerGroupForm: false,

  changeTitleFilter: task(function * (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),

  sortedSchools: computed('model.schools', async function() {
    const schools = await this.get('model.schools');
    return schools.sortBy('title');
  }),

  programs: computed('selectedSchool', async function(){
    const school = await this.selectedSchool;
    if(isEmpty(school)){
      return [];
    }
    return await this.store.query('program', {
      filters: {
        school: school.get('id')
      }
    });
  }),

  sortedPrograms: computed('programs', async function(){
    const programs = await this.programs;
    return programs.sortBy('title');
  }),

  programYears: computed('selectedProgram', 'selectedProgram.programYears.[]', async function(){
    const program = await this.selectedProgram;
    if(isEmpty(program)){
      return [];
    }
    return await this.store.query('programYear', {
      filters: {
        program: program.get('id')
      }
    });
  }),

  sortedProgramYears: computed('programYears.[]', async function() {
    const programYears = await this.programYears;
    return programYears.sortBy('startYear').reverse();
  }),

  learnerGroups: computed('selectedProgramYear.cohort.rootLevelLearnerGroups.[]', 'newGroup', 'deletedGroup', async function(){
    const programYear = await this.selectedProgramYear;
    if(isEmpty(programYear)) {
      return [];
    }
    const cohort = await programYear.get('cohort');
    return await cohort.get('rootLevelLearnerGroups');
  }),

  filteredLearnerGroups: computed('titleFilter', 'learnerGroups.[]', async function(){
    const titleFilter = this.titleFilter;
    const title = isBlank(titleFilter) ? '' : titleFilter;
    const learnerGroups = await this.learnerGroups;
    let filteredGroups;
    if (isEmpty(title)) {
      filteredGroups = learnerGroups.sortBy('title');
    } else {
      filteredGroups = learnerGroups.filter(learnerGroup => {
        return isPresent(learnerGroup.get('title'))
          && learnerGroup.get('title').toLowerCase().includes(title.toLowerCase());
      });
    }
    return filteredGroups.sortBy('title');
  }),

  selectedSchool: computed('model.schools.[]', 'schoolId', async function(){
    let schools = await this.get('model.schools');
    const schoolId = this.schoolId;
    if(isPresent(schoolId)){
      const school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    const user = await this.currentUser.get('model');
    return await user.get('school');
  }),

  selectedProgram: computed('programs.[]', 'programId', async function(){
    const programs = await this.programs;
    let program;
    const programId = this.programId;
    if(isPresent(programId)){
      program = programs.findBy('id', programId);
    }

    if(program){
      return program;
    }

    if(isEmpty(programs)) {
      return null;
    }

    return programs.sortBy('title').get('firstObject');
  }),

  selectedProgramYear: computed('programYears.[]', 'programYearId', async function(){
    const programYears = await this.programYears;
    let programYear;
    const programYearId = this.programYearId;
    if(isPresent(programYearId)){
      programYear = programYears.findBy('id', programYearId);
    }
    if(programYear) {
      return programYear;
    }
    return programYears.sortBy('startYear').get('lastObject');
  }),

  copyGroup: task(function * (withLearners, learnerGroup) {
    const store = this.store;
    const intl = this.intl;
    const cohort = yield learnerGroup.get('cohort');
    const newGroups = yield cloneLearnerGroup(store, learnerGroup, cohort, withLearners);
    this.set('totalGroupsToSave', newGroups.length);
    // indicate that the top group is a copy
    newGroups[0].set('title', newGroups[0].get('title') + ` (${intl.t('general.copy')})`);
    // save groups one at a time because we need to save in this order so parents are saved before children
    for (let i = 0; i < newGroups.length; i++) {
      yield newGroups[i].save();
      this.set('currentGroupsSaved', i + 1);
    }
    this.set('newGroup', newGroups[0]);
  }),

  canCreate: computed('selectedSchool', async function () {
    const permissionChecker = this.permissionChecker;
    const selectedSchool = await this.selectedSchool;
    return permissionChecker.canCreateLearnerGroup(selectedSchool);
  }),

  canDelete: computed('selectedSchool', async function () {
    const permissionChecker = this.permissionChecker;
    const selectedSchool = await this.selectedSchool;
    return permissionChecker.canDeleteLearnerGroupInSchool(selectedSchool);
  }),

  actions: {
    editLearnerGroup(learnerGroup) {
      this.transitionToRoute('learnerGroup', learnerGroup);
    },

    async removeLearnerGroup(learnerGroup) {
      const programYear = await this.selectedProgramYear;
      const cohort = await programYear.get('cohort');
      const learnerGroups = await cohort.get('learnerGroups');
      const descendants = await learnerGroup.get('allDescendants');
      descendants.forEach(descendant => {
        learnerGroups.removeObject(descendant);
      });
      learnerGroups.removeObject(learnerGroup);
      await learnerGroup.destroyRecord();
      this.set('deletedGroup', learnerGroup);
      const newGroup = this.newGroup;
      if (newGroup === learnerGroup) {
        this.set('newGroup', null);
      }
    },

    toggleNewLearnerGroupForm() {
      this.set('showNewLearnerGroupForm', !this.showNewLearnerGroupForm);
    },

    async saveNewLearnerGroup(title, fillWithCohort) {
      const store = this.store;
      const selectedProgramYear = await this.selectedProgramYear;
      const cohort = await selectedProgramYear.get('cohort');
      const newLearnerGroup = store.createRecord('learner-group', { title, cohort });
      if (fillWithCohort) {
        const users = await cohort.get('users');
        newLearnerGroup.get('users').pushObjects(users.toArray());
        await newLearnerGroup.save();
        this.set('newGroup', newLearnerGroup);
        this.send('cancel');
      } else {
        await newLearnerGroup.save();
        this.set('newGroup', newLearnerGroup);
        this.send('cancel');
      }
    },

    cancel() {
      this.set('showNewLearnerGroupForm', false);
    },

    async changeSelectedProgram(programId) {
      const programs = await this.programs;
      const program = programs.findBy('id', programId);
      const school = await program.get('school');
      this.set('schoolId', school.get('id'));
      this.set('programId', programId);
      this.set('programYearId', null);

    },

    async changeSelectedProgramYear(programYearId) {
      const programYears = await this.programYears;
      const programYear = programYears.findBy('id', programYearId);
      const program = await programYear.get('program');
      const school = await program.get('school');
      this.set('schoolId', school.get('id'));
      this.set('programId', program.get('id'));
      this.set('programYearId', programYearId);
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
      this.set('programId', null);
      this.set('programYearId', null);
    },
  }
});
