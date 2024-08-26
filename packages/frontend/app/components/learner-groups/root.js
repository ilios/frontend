import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import cloneLearnerGroup from 'frontend/utils/clone-learner-group';
import { dropTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { action } from '@ember/object';

export default class LearnerGroupsRootComponent extends Component {
  @service currentUser;
  @service store;
  @service dataLoader;
  @service intl;
  @service permissionChecker;
  @tracked showNewLearnerGroupForm = false;
  @tracked savedLearnerGroup;
  @tracked totalGroupsToSave;
  @tracked currentGroupsSaved;

  learnerGroupPromises = new Map();
  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.selectedSchool
        ? this.permissionChecker.canCreateLearnerGroup(this.selectedSchool)
        : false,
    );
  }

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get programsData() {
    return new TrackedAsyncData(this.selectedSchool.programs);
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  get programs() {
    return this.programsData.isResolved ? this.programsData.value : null;
  }

  @cached
  get defaultSelectedProgramData() {
    return new TrackedAsyncData(this.findBestDefaultProgram(this.programs));
  }

  get defaultSelectedProgram() {
    return this.defaultSelectedProgramData.isResolved
      ? this.defaultSelectedProgramData.value
      : null;
  }

  @cached
  get programYearsData() {
    return new TrackedAsyncData(this.selectedProgram?.programYears);
  }

  get programYears() {
    return this.programYearsData.isResolved ? this.programYearsData.value : null;
  }

  @cached
  get selectedCohortData() {
    return new TrackedAsyncData(this.cohortLoadingPromise);
  }

  get selectedCohort() {
    return this.selectedCohortData.isResolved ? this.selectedCohortData.value : null;
  }

  @cached
  get learnerGroupsData() {
    return new TrackedAsyncData(this.selectedCohort?.learnerGroups);
  }

  get learnerGroups() {
    return this.learnerGroupsData.isResolved ? this.learnerGroupsData.value : null;
  }

  get newLearnerGroup() {
    //ensure we only show groups that haven't been deleted
    return this.rootLevelLearnerGroups?.includes(this.savedLearnerGroup)
      ? this.savedLearnerGroup
      : null;
  }

  get cohortLoadingPromise() {
    const id = this.selectedProgramYear?.belongsTo('cohort').id();
    if (id) {
      return this.dataLoader.loadCohortLearnerGroups(id);
    }

    return undefined;
  }

  get isLoaded() {
    return Boolean(this.selectedCohort);
  }

  get selectedSchool() {
    const schoolId = this.args.schoolId ?? this.user?.belongsTo('school').id();

    const school = findById(this.args.schools, schoolId) ?? this.args.schools[0];
    //trigger a pre-load of the data we need to load an individual group in this school
    this.dataLoader.loadInstructorGroupsForSchool(school.id);
    return school;
  }

  get selectedProgram() {
    if (!this.programs) {
      return null;
    }
    if (this.args.programId) {
      return findById(this.programs, this.args.programId);
    }

    return this.defaultSelectedProgram;
  }

  get selectedProgramYear() {
    if (!this.programYears) {
      return null;
    }
    if (this.args.programYearId) {
      return findById(this.programYears, this.args.programYearId);
    }

    return sortBy(this.programYears, 'startYear').reverse()[0];
  }

  get rootLevelLearnerGroups() {
    if (!this.learnerGroups) {
      return [];
    }
    return this.learnerGroups.filter((learnerGroup) => !learnerGroup.belongsTo('parent').id());
  }

  get filteredLearnerGroups() {
    if (!this.args.titleFilter) {
      return this.rootLevelLearnerGroups;
    }
    const filter = this.args.titleFilter.trim().toLowerCase();
    return this.rootLevelLearnerGroups.filter((learnerGroup) => {
      return learnerGroup.title && learnerGroup.title.trim().toLowerCase().includes(filter);
    });
  }

  saveNewLearnerGroup = dropTask(async (title, fillWithCohort) => {
    const group = this.store.createRecord('learner-group', {
      title,
      cohort: this.selectedCohort,
    });
    if (fillWithCohort) {
      const users = await this.selectedCohort.users;
      group.set('users', users);
    }
    this.savedLearnerGroup = await group.save();
    this.showNewLearnerGroupForm = false;
  });

  copyGroup = dropTask(async (withLearners, groupToCopy) => {
    const cohort = await groupToCopy.cohort;
    const newGroups = await cloneLearnerGroup(this.store, groupToCopy, cohort, withLearners);
    this.totalGroupsToSave = newGroups.length;
    // indicate that the top group is a copy
    newGroups[0].title += ` (${this.intl.t('general.copy')})`;

    this.currentGroupsSaved = 0;
    // save groups one at a time because we need to save in this order so parents are saved before children
    for (let i = 0; i < newGroups.length; i++) {
      await newGroups[i].save();
      this.currentGroupsSaved++;
    }
    this.savedLearnerGroup = newGroups[0];
  });

  async findBestDefaultProgram(programs) {
    if (!programs) {
      return null;
    }
    const sortingPrograms = await map(programs, async (program) => {
      const thisYear = new Date().getFullYear();
      const programYears = await program.programYears;
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
        },
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

    return sorted[0]?.program;
  }

  @action
  setSchoolId(schoolId) {
    this.args.setProgramId(null);
    this.args.setProgramYearId(null);
    this.args.setSchoolId(schoolId);
  }

  setProgramId = dropTask(async (programId) => {
    const program = findById(this.programs, programId);
    const school = await program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(program.id);
    this.args.setProgramYearId(null);
  });

  setProgramYearId = dropTask(async (programYearId) => {
    const programYear = findById(this.programYears, programYearId);
    const program = await programYear.program;
    const school = await program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(program.id);
    this.args.setProgramYearId(programYear.id);
  });
}
