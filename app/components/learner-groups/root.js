import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';
import { dropTask } from 'ember-concurrency';
import { map } from 'rsvp';
import cloneLearnerGroup from 'ilios/utils/clone-learner-group';
import { action } from '@ember/object';

export default class LearnerGroupsRootComponent extends Component {
  @service currentUser;
  @service store;
  @service dataLoader;
  @service intl;
  @tracked showNewLearnerGroupForm = false;
  @tracked savedLearnerGroup;
  @tracked totalGroupsToSave;
  @tracked currentGroupsSaved;

  learnerGroupPromises = new Map();

  @use user = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use canCreate = new PermissionChecker(() => ['canCreateLearnerGroup', this.selectedSchool]);
  @use programs = new ResolveAsyncValue(() => [this.selectedSchool.programs]);
  @use defaultSelectedProgram = new ResolveAsyncValue(() => [
    this.findBestDefaultProgram(this.programs),
  ]);
  @use programYears = new ResolveAsyncValue(() => [this.selectedProgram?.programYears]);
  @use selectedCohort = new ResolveAsyncValue(() => [this.cohortLoadingPromise]);
  @use learnerGroups = new ResolveAsyncValue(() => [
    this.selectedCohort?.rootLevelLearnerGroups,
    [],
  ]);

  get newLearnerGroup() {
    //ensure we only show groups that haven't been deleted
    return this.learnerGroups?.includes(this.savedLearnerGroup) ? this.savedLearnerGroup : null;
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

    const school = this.args.schools.findBy('id', schoolId) ?? this.args.schools.firstObject;
    //trigger a pre-load of the data we need to load an individual group in this school
    this.dataLoader.loadInstructorGroupsForSchool(school.id);
    return school;
  }

  get selectedProgram() {
    if (!this.programs) {
      return null;
    }
    if (this.args.programId) {
      return this.programs.findBy('id', this.args.programId);
    }

    return this.defaultSelectedProgram;
  }

  get selectedProgramYear() {
    if (!this.programYears) {
      return null;
    }
    if (this.args.programYearId) {
      return this.programYears.findBy('id', this.args.programYearId);
    }

    return this.programYears.sortBy('startYear').lastObject;
  }

  get filteredLearnerGroups() {
    if (!this.learnerGroups) {
      return [];
    }
    if (!this.args.titleFilter) {
      return this.learnerGroups.toArray();
    }
    const filter = this.args.titleFilter.trim().toLowerCase();
    return this.learnerGroups.filter((learnerGroup) => {
      return learnerGroup.title && learnerGroup.title.trim().toLowerCase().includes(filter);
    });
  }

  @dropTask
  *saveNewLearnerGroup(title, fillWithCohort) {
    const group = this.store.createRecord('learner-group', {
      title,
      cohort: this.selectedCohort,
    });
    if (fillWithCohort) {
      const users = (yield this.selectedCohort.users).toArray();
      group.set('users', users);
    }
    this.savedLearnerGroup = yield group.save();
    this.showNewLearnerGroupForm = false;
  }

  @dropTask
  *copyGroup(withLearners, groupToCopy) {
    const cohort = yield groupToCopy.cohort;
    const newGroups = yield cloneLearnerGroup(this.store, groupToCopy, cohort, withLearners);
    this.totalGroupsToSave = newGroups.length;
    // indicate that the top group is a copy
    newGroups[0].title += ` (${this.intl.t('general.copy')})`;

    this.currentGroupsSaved = 0;
    // save groups one at a time because we need to save in this order so parents are saved before children
    for (let i = 0; i < newGroups.length; i++) {
      yield newGroups[i].save();
      this.currentGroupsSaved++;
    }
    this.savedLearnerGroup = newGroups[0];
  }

  async findBestDefaultProgram(programs) {
    if (!programs) {
      return null;
    }
    const sortingPrograms = await map(programs.toArray(), async (program) => {
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

    return sorted[0]?.program;
  }

  @action
  setSchoolId(schoolId) {
    this.args.setProgramId(null);
    this.args.setProgramYearId(null);
    this.args.setSchoolId(schoolId);
  }

  @dropTask
  *setProgramId(programId) {
    const program = this.programs.findBy('id', programId);
    const school = yield program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(program.id);
    this.args.setProgramYearId(null);
  }

  @dropTask
  *setProgramYearId(programYearId) {
    const programYear = this.programYears.findBy('id', programYearId);
    const program = yield programYear.program;
    const school = yield program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(program.id);
    this.args.setProgramYearId(programYear.id);
  }
}
