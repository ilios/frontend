/* eslint ember/order-in-controllers: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { isBlank, isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';
import cloneLearnerGroup from '../utils/clone-learner-group';
import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Controller.extend({
  currentUser: service(),
  permissionChecker: service(),
  i18n: service(),
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
    const school = await this.get('selectedSchool');
    if(isEmpty(school)){
      return [];
    }
    return await this.get('store').query('program', {
      filters: {
        school: school.get('id'),
        published: true
      }
    });
  }),

  sortedPrograms: computed('programs', async function(){
    const programs = await this.get('programs');
    return programs.sortBy('title');
  }),

  programYears: computed('selectedProgram', 'selectedProgram.programYears.[]', async function(){
    const program = await this.get('selectedProgram');
    if(isEmpty(program)){
      return [];
    }
    return await this.get('store').query('programYear', {
      filters: {
        program: program.get('id'),
        published: true
      }
    });
  }),

  sortedProgramYears: computed('programYears.[]', async function() {
    const programYears = await this.get('programYears');
    return programYears.sortBy('startYear').reverse();
  }),

  learnerGroups: computed('selectedProgramYear.cohort.rootLevelLearnerGroups.[]', 'newGroup', 'deletedGroup', async function(){
    const programYear = await this.get('selectedProgramYear');
    if(isEmpty(programYear)) {
      return [];
    }
    const cohort = await programYear.get('cohort');
    return await cohort.get('rootLevelLearnerGroups');
  }),

  filteredLearnerGroups: computed('titleFilter', 'learnerGroups.[]', async function(){
    const titleFilter = this.get('titleFilter');
    const title = isBlank(titleFilter) ? '' : titleFilter;
    const cleanTitle = escapeRegExp(title);
    const learnerGroups = await this.get('learnerGroups');
    const exp = new RegExp(cleanTitle, 'gi');
    let filteredGroups;
    if (isEmpty(cleanTitle)) {
      filteredGroups = learnerGroups.sortBy('title');
    } else {
      filteredGroups = learnerGroups.filter(learnerGroup => {
        return isPresent(learnerGroup.get('title')) && learnerGroup.get('title').match(exp);
      });
    }
    return filteredGroups.sortBy('title');
  }),

  selectedSchool: computed('model.schools.[]', 'schoolId', async function(){
    let schools = await this.get('model.schools');
    const schoolId = this.get('schoolId');
    if(isPresent(schoolId)){
      const school = schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    const user = await this.get('currentUser').get('model');
    return await user.get('school');
  }),

  selectedProgram: computed('programs.[]', 'programId', async function(){
    const programs = await this.get('programs');
    let program;
    const programId = this.get('programId');
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
    const programYears = await this.get('programYears');
    let programYear;
    const programYearId = this.get('programYearId');
    if(isPresent(programYearId)){
      programYear = programYears.findBy('id', programYearId);
    }
    if(programYear) {
      return programYear;
    }
    return programYears.sortBy('startYear').get('lastObject');
  }),

  copyGroup: task(function * (withLearners, learnerGroup) {
    const store = this.get('store');
    const i18n = this.get('i18n');
    const cohort = yield learnerGroup.get('cohort');
    const newGroups = yield cloneLearnerGroup(store, learnerGroup, cohort, withLearners);
    this.set('totalGroupsToSave', newGroups.length);
    // indicate that the top group is a copy
    newGroups[0].set('title', newGroups[0].get('title') + ` (${i18n.t('general.copy')})`);
    // save groups one at a time because we need to save in this order so parents are saved before children
    for (let i = 0; i < newGroups.length; i++) {
      yield newGroups[i].save();
      this.set('currentGroupsSaved', i + 1);
    }
    this.set('newGroup', newGroups[0]);
  }),

  canCreateLearnerGroup: computed('selectedSchool', 'currentUser', async function () {
    if (!enforceRelationshipCapabilityPermissions) {
      return true;
    }
    const permissionChecker = this.get('permissionChecker');
    const selectedSchool = await this.get('selectedSchool');
    return permissionChecker.canCreateLearnerGroup(selectedSchool);
  }),

  canDeleteLearnerGroup: computed('selectedSchool', 'currentUser', async function () {
    if (!enforceRelationshipCapabilityPermissions) {
      return true;
    }
    const permissionChecker = this.get('permissionChecker');
    const selectedSchool = await this.get('selectedSchool');
    return permissionChecker.canDeleteLearnerGroup(selectedSchool);
  }),

  actions: {
    editLearnerGroup(learnerGroup) {
      this.transitionToRoute('learnerGroup', learnerGroup);
    },

    async removeLearnerGroup(learnerGroup) {
      const programYear = await this.get('selectedProgramYear');
      const cohort = await programYear.get('cohort');
      const learnerGroups = await cohort.get('learnerGroups');
      const descendants = await learnerGroup.get('allDescendants');
      descendants.forEach(descendant => {
        learnerGroups.removeObject(descendant);
      });
      learnerGroups.removeObject(learnerGroup);
      await learnerGroup.destroyRecord();
      this.set('deletedGroup', learnerGroup);
      const newGroup = this.get('newGroup');
      if (newGroup === learnerGroup) {
        this.set('newGroup', null);
      }
    },

    toggleNewLearnerGroupForm() {
      this.set('showNewLearnerGroupForm', !this.get('showNewLearnerGroupForm'));
    },

    async saveNewLearnerGroup(title, fillWithCohort) {
      const store = this.get('store');
      const selectedProgramYear = await this.get('selectedProgramYear');
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
      const programs = await this.get('programs');
      const program = programs.findBy('id', programId);
      const school = await program.get('school');
      this.set('schoolId', school.get('id'));
      this.set('programId', programId);
      this.set('programYearId', null);

    },

    async changeSelectedProgramYear(programYearId) {
      const programYears = await this.get('programYears');
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
