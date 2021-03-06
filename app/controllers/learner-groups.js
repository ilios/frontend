import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import cloneLearnerGroup from '../utils/clone-learner-group';
import { map } from 'rsvp';

export default Controller.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),
  store: service(),
  dataLoader: service(),

  queryParams: {
    programId: 'program',
    programYearId: 'programYear',
    schoolId: 'school',
    sortLearnerGroupsBy: 'sortBy',
    titleFilter: 'filter',
  },

  currentGroupsSaved: 0,
  deletedGroup: null,
  newGroup: null,
  programId: null,
  programYearId: null,
  schoolId: null,
  showNewLearnerGroupForm: false,
  sortLearnerGroupsBy: 'title',
  titleFilter: null,
  totalGroupsToSave: 0,

  programs: computed('selectedSchool', async function () {
    const school = await this.selectedSchool;
    if (isEmpty(school)) {
      return [];
    }
    return school.programs;
  }),

  programYears: computed('selectedProgram', 'selectedProgram.programYears.[]', async function () {
    const program = await this.selectedProgram;
    if (isEmpty(program)) {
      return [];
    }
    return program.programYears;
  }),

  learnerGroups: computed(
    'selectedProgramYear.cohort.rootLevelLearnerGroups.[]',
    'newGroup',
    'deletedGroup',
    async function () {
      const programYear = await this.selectedProgramYear;
      if (isEmpty(programYear)) {
        return [];
      }
      const cohort = await programYear.cohort;
      return await cohort.get('rootLevelLearnerGroups');
    }
  ),

  filteredLearnerGroups: computed('titleFilter', 'learnerGroups.[]', async function () {
    const titleFilter = this.titleFilter;
    const title = isBlank(titleFilter) ? '' : titleFilter.trim().toLowerCase();
    const learnerGroups = await this.learnerGroups;
    let filteredGroups;
    if (isEmpty(title)) {
      filteredGroups = learnerGroups.sortBy('title');
    } else {
      filteredGroups = learnerGroups.filter((learnerGroup) => {
        return (
          isPresent(learnerGroup.get('title')) &&
          learnerGroup.get('title').trim().toLowerCase().includes(title)
        );
      });
    }
    return filteredGroups.sortBy('title');
  }),

  selectedSchool: computed('model.[]', 'schoolId', async function () {
    const user = await this.currentUser.getModel();
    const schoolId = this.schoolId ?? user.belongsTo('school').id();

    return this.model.findBy('id', schoolId);
  }),

  selectedProgram: computed('programs.[]', 'programId', async function () {
    const programs = (await this.programs).toArray();
    if (isPresent(this.programId)) {
      const program = programs.findBy('id', this.programId);
      if (program) {
        return program;
      }
    }

    return this.findBestDefaultProgram(programs);
  }),

  selectedProgramYear: computed('programYears.[]', 'programYearId', async function () {
    const programYears = await this.programYears;
    const programYearId = this.programYearId;
    if (isPresent(programYearId)) {
      const programYear = programYears.findBy('id', programYearId);
      if (programYear) {
        await this.dataLoader.loadCohortForLearnerGroups(programYear.belongsTo('cohort').id());
        return programYear;
      }
    }

    const latestYear = programYears.sortBy('startYear').get('lastObject');
    if (latestYear) {
      await this.dataLoader.loadCohortForLearnerGroups(latestYear.belongsTo('cohort').id());
      return latestYear;
    }

    return null;
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
      descendants.forEach((descendant) => {
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
  },

  changeTitleFilter: task(function* (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),

  copyGroup: task(function* (withLearners, learnerGroup) {
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
  async findBestDefaultProgram(programs) {
    if (!programs) {
      return null;
    }
    const sortingPrograms = await map(programs, async (program) => {
      const thisYear = new Date().getFullYear();
      const programYears = (await program.programYears).toArray();
      const sorters = await map(programYears, async (programYear) => {
        const groupCount = (await programYear.cohort).hasMany('learnerGroups').ids().length;
        return {
          distanceFromThisYear: thisYear - Number(programYear.startYear),
          groupCount,
        };
      });
      return sorters.reduce(
        (obj, sorter) => {
          if (sorter.distanceFromThisYear < obj.distance) {
            obj.distance = sorter.distanceFromThisYear;
          }
          obj.totalGroups += sorter.groupCount;
          return obj;
        },
        {
          title: program.title,
          program,
          totalGroups: 0,
          distance: 100,
        }
      );
    });
    const sorted = sortingPrograms.sort((a, b) => {
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      if (a.totalGroups !== b.totalGroups) {
        return b.totalGroups - a.totalGroups;
      }

      return a.title.localeCompare(b.title);
    });

    return sorted[0].program;
  },
});
