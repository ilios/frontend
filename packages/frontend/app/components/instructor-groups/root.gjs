import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';
import { task } from 'ember-concurrency';
import FaIcon from 'ilios-common/components/fa-icon';
import gt from 'ember-truth-helpers/helpers/gt';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import set from 'ember-set-helper/helpers/set';
import not from 'ember-truth-helpers/helpers/not';
import New from 'frontend/components/instructor-groups/new';
import perform from 'ember-concurrency/helpers/perform';
import { LinkTo } from '@ember/routing';
import List from 'frontend/components/instructor-groups/list';
import Loading from 'frontend/components/instructor-groups/loading';

export default class InstructorGroupsRootComponent extends Component {
  @service currentUser;
  @service store;
  @service dataLoader;
  @service permissionChecker;
  @tracked showNewInstructorGroupForm = false;
  @tracked newInstructorGroup;
  @tracked instructorGroupPromises = new Map();
  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.bestSelectedSchool
        ? this.permissionChecker.canCreateInstructorGroup(this.bestSelectedSchool)
        : false,
    );
  }

  @cached
  get loadedSchoolData() {
    return new TrackedAsyncData(this.getSchoolPromise(this.bestSelectedSchool.id));
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value : false;
  }

  get loadedSchool() {
    return this.loadedSchoolData.isResolved ? this.loadedSchoolData.value : null;
  }

  @cached
  get instructorGroupsData() {
    return new TrackedAsyncData(this.bestSelectedSchool.instructorGroups);
  }

  get instructorGroups() {
    return this.instructorGroupsData.isResolved ? this.instructorGroupsData.value : [];
  }

  get isLoaded() {
    return Boolean(this.loadedSchool);
  }

  get countForSelectedSchool() {
    return this.bestSelectedSchool.hasMany('instructorGroups').ids().length;
  }

  async getSchoolPromise(schoolId) {
    if (!this.instructorGroupPromises.has(schoolId)) {
      this.instructorGroupPromises.set(
        schoolId,
        Promise.all([
          this.dataLoader.loadInstructorGroupsForSchool(schoolId),
          this.store.query('instructor-group', {
            include: 'offerings.session.course,ilmSessions.session.course',
            filters: {
              school: schoolId,
            },
          }),
        ]),
      );
    }
    const arr = await this.instructorGroupPromises.get(schoolId);
    return arr[1];
  }

  get bestSelectedSchool() {
    if (this.args.schoolId) {
      return findById(this.args.schools, this.args.schoolId);
    }

    const schoolId = this.user?.belongsTo('school').id();
    return schoolId ? findById(this.args.schools, schoolId) : this.args.schools[0];
  }

  get filteredInstructorGroups() {
    if (!this.args.titleFilter) {
      return this.instructorGroups;
    }
    const filter = this.args.titleFilter.trim().toLowerCase();
    return this.instructorGroups.filter((instructorGroup) => {
      return instructorGroup.title && instructorGroup.title.trim().toLowerCase().includes(filter);
    });
  }

  saveNewInstructorGroup = task({ drop: true }, async (newInstructorGroup) => {
    newInstructorGroup.set('school', this.bestSelectedSchool);
    this.newInstructorGroup = await newInstructorGroup.save();
    this.showNewInstructorGroupForm = false;
  });
  <template>
    <section class="instructor-groups-root" data-test-instructor-groups>
      <div class="filters">
        <div class="schools" data-test-school-filter>
          <FaIcon @icon="building-columns" @fixedWidth={{true}} />
          {{#if (gt @schools.length 1)}}
            <select
              {{on "change" (pick "target.value" @setSchoolId)}}
              aria-label={{t "general.schools"}}
              data-test-school-selector
            >
              {{#each (sortBy "title" @schools) as |school|}}
                <option selected={{eq school.id this.bestSelectedSchool.id}} value={{school.id}}>
                  {{school.title}}
                </option>
              {{/each}}
            </select>
          {{else}}
            {{this.bestSelectedSchool.title}}
          {{/if}}
        </div>
        <div class="title" data-test-title-filter>
          <input
            aria-label={{t "general.instructorGroupTitleFilterPlaceholder"}}
            value={{@titleFilter}}
            {{on "input" (pick "target.value" @setTitleFilter)}}
            placeholder={{t "general.instructorGroupTitleFilterPlaceholder"}}
            data-test-title-filter
          />
        </div>
      </div>

      <div class="main-list">
        <div class="header">
          <h2 class="title">
            {{t "general.instructorGroups"}}
            {{#if this.isLoaded}}
              ({{this.filteredInstructorGroups.length}})
            {{/if}}
          </h2>
          <div class="actions">
            {{#if this.canCreate}}
              <ExpandCollapseButton
                @value={{this.showNewInstructorGroupForm}}
                @action={{set
                  this
                  "showNewInstructorGroupForm"
                  (not this.showNewInstructorGroupForm)
                }}
                @expandButtonLabel={{t "general.expand"}}
                @collapseButtonLabel={{t "general.close"}}
              />
            {{/if}}
          </div>
        </div>

        <div class="new">
          {{#if this.showNewInstructorGroupForm}}
            <New
              @save={{perform this.saveNewInstructorGroup}}
              @cancel={{set this "showNewInstructorGroupForm" false}}
            />
          {{/if}}
          {{#if this.newInstructorGroup}}
            <div class="saved-result">
              <LinkTo @route="instructor-group" @model={{this.newInstructorGroup}}>
                <FaIcon @icon="square-up-right" />
                {{this.newInstructorGroup.title}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
        </div>
        <div class="list">
          {{#if this.isLoaded}}
            <List
              @instructorGroups={{this.filteredInstructorGroups}}
              @sortBy={{@sortBy}}
              @setSortBy={{@setSortBy}}
            />
          {{else}}
            <Loading @count={{this.countForSelectedSchool}} />
          {{/if}}
        </div>
      </div>
    </section>
  </template>
}
