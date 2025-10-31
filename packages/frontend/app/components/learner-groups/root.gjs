import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import cloneLearnerGroup from 'frontend/utils/clone-learner-group';
import { task } from 'ember-concurrency';
import { map } from 'rsvp';
import { action } from '@ember/object';
import FaIcon from 'ilios-common/components/fa-icon';
import gt from 'ember-truth-helpers/helpers/gt';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import sortBy0 from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import perform from 'ember-concurrency/helpers/perform';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import New from 'frontend/components/learner-group/new';
import { LinkTo } from '@ember/routing';
import List from 'frontend/components/learner-group/list';
import Loading from 'frontend/components/learner-groups/loading';
import WaitSaving from 'ilios-common/components/wait-saving';

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
    return this.selectedCohortData.isResolved ? this.selectedCohortData.value : undefined;
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

    return null;
  }

  get isLoaded() {
    return undefined !== this.selectedCohort;
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

  saveNewLearnerGroup = task({ drop: true }, async (title, fillWithCohort) => {
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

  copyGroup = task({ drop: true }, async (withLearners, groupToCopy) => {
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

  setProgramId = task({ drop: true }, async (programId) => {
    const program = findById(this.programs, programId);
    const school = await program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(program.id);
    this.args.setProgramYearId(null);
  });

  setProgramYearId = task({ drop: true }, async (programYearId) => {
    const programYear = findById(this.programYears, programYearId);
    const program = await programYear.program;
    const school = await program.school;
    this.args.setSchoolId(school.id);
    this.args.setProgramId(program.id);
    this.args.setProgramYearId(programYear.id);
  });
  <template>
    <section class="learner-groups-root" data-test-learner-groups>
      <div class="filters">
        <div class="filter" data-test-school-filter>
          <FaIcon @icon="building-columns" @fixedWidth={{true}} />
          {{#if (gt @schools.length 1)}}
            <select
              {{on "change" (pick "target.value" this.setSchoolId)}}
              aria-label={{t "general.schools"}}
              data-test-school-selector
            >
              {{#each (sortBy0 "title" @schools) as |school|}}
                <option selected={{eq school.id this.selectedSchool.id}} value={{school.id}}>
                  {{school.title}}
                </option>
              {{/each}}
            </select>
          {{else}}
            {{this.selectedSchool.title}}
          {{/if}}
        </div>
        <div class="filter" data-test-program-filter>
          <FaIcon @icon="users" @fixedWidth={{true}} />
          {{#if (gt this.programs.length 1)}}
            <select
              {{on "change" (pick "target.value" (perform this.setProgramId))}}
              aria-label={{t "general.programs"}}
              data-test-program-selector
            >
              {{#each (sortBy0 "title" this.programs) as |program|}}
                <option selected={{eq program.id this.selectedProgram.id}} value={{program.id}}>
                  {{program.title}}
                </option>
              {{/each}}
            </select>
          {{else if (eq this.programs.length 1)}}
            {{this.selectedProgram.title}}
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </div>
        <div class="filter" data-test-program-year-filter>
          <FaIcon @icon="calendar" @fixedWidth={{true}} />
          {{#if (gt this.programYears.length 1)}}
            <select
              {{on "change" (pick "target.value" (perform this.setProgramYearId))}}
              aria-label={{t "general.programYears"}}
              data-test-program-selector
            >
              {{#each (sortBy0 "startYear:desc" this.programYears) as |programYear|}}
                <option
                  selected={{eq programYear.id this.selectedProgramYear.id}}
                  value={{programYear.id}}
                >
                  {{programYear.cohort.title}}
                </option>
              {{/each}}
            </select>
          {{else if (eq this.programYears.length 1)}}
            {{this.selectedProgramYear.cohort.title}}
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </div>
        <div class="filter" data-test-title-filter>
          <input
            aria-label={{t "general.learnerGroupTitleFilterPlaceholder"}}
            value={{@titleFilter}}
            {{on "input" (pick "target.value" @setTitleFilter)}}
            placeholder={{t "general.learnerGroupTitleFilterPlaceholder"}}
            data-test-title-filter
          />
        </div>
      </div>

      <div class="main-list">
        <div class="header">
          <h2 class="title">
            {{t "general.learnerGroups"}}
            {{#if this.isLoaded}}
              ({{this.filteredLearnerGroups.length}})
            {{/if}}
          </h2>
          <div class="actions">
            {{#if this.canCreate}}
              <ExpandCollapseButton
                @value={{this.showNewLearnerGroupForm}}
                @action={{set this "showNewLearnerGroupForm" (not this.showNewLearnerGroupForm)}}
                @expandButtonLabel={{t "general.expand"}}
                @collapseButtonLabel={{t "general.close"}}
              />
            {{/if}}
          </div>
        </div>

        <div class="new">
          {{#if this.showNewLearnerGroupForm}}
            <New
              @save={{perform this.saveNewLearnerGroup}}
              @cancel={{set this "showNewLearnerGroupForm" false}}
              @fillModeSupported={{true}}
            />
          {{/if}}
          {{#if this.newLearnerGroup}}
            <div class="saved-result">
              <LinkTo @route="learner-group" @model={{this.newLearnerGroup}}>
                <FaIcon @icon="square-up-right" />
                {{this.newLearnerGroup.title}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </div>
        <div class="list">
          {{#if this.isLoaded}}
            <List
              @learnerGroups={{this.filteredLearnerGroups}}
              @canCopyWithLearners={{true}}
              @copyGroup={{perform this.copyGroup}}
              @sortBy={{@sortBy}}
              @setSortBy={{@setSortBy}}
            />
          {{else}}
            <Loading @count={{2}} />
          {{/if}}
        </div>
      </div>
    </section>

    {{#if this.copyGroup.isRunning}}
      <WaitSaving
        @showProgress={{true}}
        @totalProgress={{this.totalGroupsToSave}}
        @currentProgress={{this.currentGroupsSaved}}
      />
    {{/if}}
  </template>
}
