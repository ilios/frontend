import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { service } from '@ember/service';
import { all, map } from 'rsvp';
import { dropTask, enqueueTask, restartableTask, task } from 'ember-concurrency';
import pad from 'pad';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import cloneLearnerGroup from '../../utils/clone-learner-group';
import countDigits from '../../utils/count-digits';
import { uniqueId, fn } from '@ember/helper';
import WaitSaving from 'ilios-common/components/wait-saving';
import Header from 'frontend/components/learner-group/header';
import t from 'ember-intl/helpers/t';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import perform from 'ember-concurrency/helpers/perform';
import EditableField from 'ilios-common/components/editable-field';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import sortBy from 'ilios-common/helpers/sort-by';
import { LinkTo } from '@ember/routing';
import add from 'ember-math-helpers/helpers/add';
import and from 'ember-truth-helpers/helpers/and';
import InstructorManager from 'frontend/components/learner-group/instructor-manager';
import InstructorsList from 'frontend/components/learner-group/instructors-list';
import or from 'ember-truth-helpers/helpers/or';
import pipe from 'ilios-common/helpers/pipe';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import not from 'ember-truth-helpers/helpers/not';
import toggle from 'ilios-common/helpers/toggle';
import BulkAssignment from 'frontend/components/learner-group/bulk-assignment';
import UserManager from 'frontend/components/learner-group/user-manager';
import Calendar from 'frontend/components/learner-group/calendar';
import Members from 'frontend/components/learner-group/members';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import New from 'frontend/components/learner-group/new';
import FaIcon from 'ilios-common/components/fa-icon';
import eq from 'ember-truth-helpers/helpers/eq';
import List from 'frontend/components/learner-group/list';
import CohortUserManager from 'frontend/components/learner-group/cohort-user-manager';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';
import { pageTitle } from 'ember-page-title';
import reverse from 'ilios-common/helpers/reverse';
const DEFAULT_URL_VALUE = 'https://';

export default class LearnerGroupRootComponent extends Component {
  @service flashMessages;
  @service intl;
  @service store;
  @service iliosConfig;
  @tracked locationBuffer = null;
  @tracked urlBuffer = null;
  @tracked showLearnerGroupCalendar = false;
  @tracked sortGroupsBy = 'title';
  @tracked isSavingGroups = false;
  @tracked savedGroup;
  @tracked showNewLearnerGroupForm = false;
  @tracked currentGroupsSaved = 0;
  @tracked totalGroupsToSave = 0;
  @tracked isManagingInstructors = false;
  @tracked filter = '';

  get location() {
    return this.locationBuffer ?? this.args.learnerGroup.location;
  }

  get url() {
    return this.urlBuffer ?? this.args.learnerGroup.url;
  }

  validations = new YupValidations(this, {
    bestUrl: string().trim().url().min(2).max(2000),
  });

  get learnerGroupId() {
    return this.args.learnerGroup.id;
  }

  get learnerGroupTitle() {
    return this.args.learnerGroup.title;
  }

  @cached
  get coursesData() {
    return new TrackedAsyncData(
      this.getCoursesForGroupWithSubgroupName(null, this.args.learnerGroup),
    );
  }

  get courses() {
    return this.coursesData.isResolved ? this.coursesData.value : [];
  }

  @cached
  get cohortData() {
    return new TrackedAsyncData(this.args.learnerGroup.cohort);
  }

  get cohort() {
    return this.cohortData.isResolved ? this.cohortData.value : null;
  }

  @cached
  get programYearData() {
    return new TrackedAsyncData(this.cohort?.programYear);
  }

  get programYear() {
    return this.programYearData.isResolved ? this.programYearData.value : null;
  }

  @cached
  get programData() {
    return new TrackedAsyncData(this.programYear?.program);
  }

  get program() {
    return this.programData.isResolved ? this.programData.value : null;
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.program?.school);
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  @cached
  get availableInstructorGroupsData() {
    return new TrackedAsyncData(this.school?.instructorGroups);
  }

  get availableInstructorGroups() {
    return this.availableInstructorGroupsData.isResolved
      ? this.availableInstructorGroupsData.value
      : [];
  }

  @cached
  get instructorsData() {
    return new TrackedAsyncData(this.args.learnerGroup.instructors);
  }

  get instructors() {
    return this.instructorsData.isResolved ? this.instructorsData.value : [];
  }

  @cached
  get instructorGroupsData() {
    return new TrackedAsyncData(this.args.learnerGroup.instructorGroups);
  }

  get instructorGroups() {
    return this.instructorGroupsData.isResolved ? this.instructorGroupsData.value : [];
  }

  get dataForInstructorGroupManagerLoaded() {
    return (
      this.availableInstructorGroupsData.isResolved &&
      this.instructorGroupsData.isResolved &&
      this.instructorsData.isResolved
    );
  }

  get cohortTitle() {
    return this.cohort?.title;
  }

  @cached
  get topLevelGroupData() {
    return new TrackedAsyncData(this.args.learnerGroup.getTopLevelGroup());
  }

  get topLevelGroup() {
    return this.topLevelGroupData.isResolved ? this.topLevelGroupData.value : null;
  }

  get topLevelGroupTitle() {
    return this.topLevelGroup?.title;
  }

  @cached
  get subGroupsData() {
    return new TrackedAsyncData(this.args.learnerGroup.children);
  }

  get subGroups() {
    return this.subGroupsData.isResolved ? this.subGroupsData.value : null;
  }

  get learnerGroups() {
    if (!this.subGroups) {
      return [];
    }
    return this.subGroups;
  }

  get bestUrl() {
    if (this.url || this.urlChanged) {
      return this.url;
    }

    return DEFAULT_URL_VALUE;
  }

  get sortUsersBy() {
    return this.args.sortUsersBy || 'fullName';
  }

  saveNewLearnerGroup = dropTask(async (title) => {
    const cohort = await this.args.learnerGroup.cohort;
    const newLearnerGroup = this.store.createRecord('learner-group', {
      cohort,
      parent: this.args.learnerGroup,
      title,
    });
    this.savedGroup = await newLearnerGroup.save();
    this.showNewLearnerGroupForm = false;
  });

  changeLocation = restartableTask(async () => {
    this.args.learnerGroup.set('location', this.location);
    await this.args.learnerGroup.save();
    this.locationBuffer = null;
  });

  @action
  async generateNewLearnerGroups(num) {
    this.savedGroup = null;
    this.currentGroupsSaved = 0;
    this.isSavingGroups = true;
    this.totalGroupsToSave = num;
    const offset = await this.args.learnerGroup.getSubgroupNumberingOffset();
    const cohort = await this.args.learnerGroup.cohort;
    const padBy = countDigits(offset + parseInt(num, 10));
    const parentTitle = this.args.learnerGroup.title.substring(0, 60 - 1 - padBy);
    const groups = [];
    for (let i = 0; i < num; i++) {
      const newGroup = this.store.createRecord('learner-group', {
        cohort,
        parent: this.args.learnerGroup,
        title: `${parentTitle} ${pad(padBy, offset + i, '0')}`,
      });
      groups.push(newGroup);
    }
    const saveSomeGroups = async (groupsToSave) => {
      const chunk = groupsToSave.splice(0, 6);
      await all(chunk.map((group) => group.save()));

      if (groupsToSave.length) {
        this.currentGroupsSaved = this.currentGroupsSaved + chunk.length;
        await saveSomeGroups(groupsToSave);
      } else {
        this.isSavingGroups = false;
        this.flashMessages.success('general.savedSuccessfully', {
          capitalize: true,
        });
        this.showNewLearnerGroupForm = false;
      }
    };
    await saveSomeGroups(groups);
  }

  @action
  revertLocationChanges() {
    this.locationBuffer = null;
  }

  @action
  selectAllText({ target }) {
    if (target.value === DEFAULT_URL_VALUE) {
      target.select();
    }
  }

  saveUrlChanges = restartableTask(async () => {
    this.validations.addErrorDisplayFor('url');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('url');
    this.args.learnerGroup.set('url', this.url);
    await this.args.learnerGroup.save();
    this.urlBuffer = null;
  });

  @action
  revertUrlChanges() {
    this.validations.removeErrorDisplayFor('url');
    this.urlBuffer = null;
  }

  @action
  changeUrl(value) {
    value = value.trim();
    const regex = RegExp('https://http[s]?:');
    if (regex.test(value)) {
      value = value.substring(8);
    }
    this.urlBuffer = value;
    this.urlChanged = true;
  }

  saveInstructors = restartableTask(async (newInstructors, newInstructorGroups) => {
    this.args.learnerGroup.set('instructors', newInstructors);
    this.args.learnerGroup.set('instructorGroups', newInstructorGroups);
    await this.args.learnerGroup.save();
    this.isManagingInstructors = false;
  });

  @cached
  get usersForMembersListData() {
    return new TrackedAsyncData(
      this.getUsersForMembersList(
        this.args.learnerGroup,
        // Learnergroup members are only referenced here to trigger a re-computation on membership changes.
        this.args.learnerGroup.users,
      ),
    );
  }

  get usersForMembersList() {
    return this.usersForMembersListData.isResolved ? this.usersForMembersListData.value : [];
  }

  async getUsersForMembersList(learnerGroup) {
    const topLevelGroup = await learnerGroup.getTopLevelGroup();
    const allDescendants = await topLevelGroup.getAllDescendants();
    const treeGroups = [topLevelGroup, ...allDescendants];
    const users = await learnerGroup.getUsersOnlyAtThisLevel();
    return await map(users, async (user) => {
      const lowestGroupInTree = await user.getLowestMemberGroupInALearnerGroupTree(treeGroups);
      return ObjectProxy.create({
        content: user,
        lowestGroupInTree,
        //special sorting property
        lowestGroupInTreeTitle: lowestGroupInTree.title,
      });
    });
  }

  @cached
  get usersForUserManagerData() {
    return new TrackedAsyncData(
      this.getUsersForUserManager(
        this.args.learnerGroup,
        // Learnergroup members are only referenced here to trigger a re-computation on membership changes.
        this.args.learnerGroup.users,
      ),
    );
  }

  get usersForUserManager() {
    return this.usersForUserManagerData.isResolved ? this.usersForUserManagerData.value : [];
  }

  async getUsersForUserManager(learnerGroup) {
    const topLevelGroup = await learnerGroup.getTopLevelGroup();
    const allDescendants = await topLevelGroup.getAllDescendants();
    const treeGroups = [topLevelGroup, ...allDescendants];
    const users = await topLevelGroup.getAllDescendantUsers();
    return await map(users, async (user) => {
      const lowestGroupInTree = await user.getLowestMemberGroupInALearnerGroupTree(treeGroups);
      return ObjectProxy.create({
        content: user,
        lowestGroupInTree,
        //special sorting property
        lowestGroupInTreeTitle: lowestGroupInTree.title,
      });
    });
  }

  @cached
  get usersForCohortManagerData() {
    // Learnergroup members are only referenced here to trigger a re-computation on membership changes.
    return new TrackedAsyncData(
      this.getUsersToPassToCohortManager(this.args.learnerGroup, this.args.learnerGroup.users),
    );
  }

  get usersForCohortManager() {
    return this.usersForCohortManagerData.isResolved ? this.usersForCohortManagerData.value : [];
  }

  async getUsersToPassToCohortManager(learnerGroup) {
    const cohort = await learnerGroup.cohort;
    const topLevelGroup = await learnerGroup.getTopLevelGroup();
    const currentUsers = await topLevelGroup.getAllDescendantUsers();
    const users = await cohort.users;
    return users.filter((user) => !currentUsers.includes(user));
  }

  addUserToGroup = enqueueTask(async (user) => {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = await learnerGroup.topLevelGroup;
    const removeGroups = await topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    const addGroups = await learnerGroup.addUserToGroupAndAllParents(user);
    await Promise.all(removeGroups.map((g) => g.save()));
    await Promise.all(addGroups.map((g) => g.save()));
  });

  removeUserToCohort = enqueueTask(async (user) => {
    const topLevelGroup = await this.args.learnerGroup.topLevelGroup;
    const groups = await topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    await all(groups.map((group) => group.save()));
  });

  addUsersToGroup = enqueueTask(async (users) => {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = await learnerGroup.topLevelGroup;
    let addGroups = [];
    let removeGroups = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      removeGroups = [
        ...removeGroups,
        ...(await topLevelGroup.removeUserFromGroupAndAllDescendants(user)),
      ];
      addGroups = [...addGroups, ...(await learnerGroup.addUserToGroupAndAllParents(user))];
    }

    await Promise.all(uniqueValues(removeGroups).map((g) => g.save()));
    await Promise.all(uniqueValues(addGroups).map((g) => g.save()));
  });

  removeUsersToCohort = enqueueTask(async (users) => {
    const topLevelGroup = await this.args.learnerGroup.topLevelGroup;
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = await topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      groupsToSave = [...groupsToSave, ...removeGroups];
    }
    await all(uniqueValues(groupsToSave).map((group) => group.save()));
  });

  createUsersToPassToCohortManager = task(async () => {
    const learnerGroup = this.args.learnerGroup;
    const cohort = await learnerGroup.cohort;
    const topLevelGroup = await learnerGroup.getTopLevelGroup();
    const currentUsers = await topLevelGroup.getAllDescendantUsers();
    const users = await cohort.users;
    return users.filter((user) => !currentUsers.includes(user));
  });

  changeNeedsAccommodation = restartableTask(async (value) => {
    this.args.learnerGroup.set('needsAccommodation', value);
    await this.args.learnerGroup.save();
  });

  copyGroup = dropTask(async (withLearners, learnerGroup) => {
    const cohort = await learnerGroup.cohort;
    const parentGroup = await learnerGroup.parent;
    const newGroups = await cloneLearnerGroup(
      this.store,
      learnerGroup,
      cohort,
      withLearners,
      parentGroup,
    );
    // indicate that the top group is a copy
    newGroups[0].title = newGroups[0].title + ` (${this.intl.t('general.copy')})`;
    this.totalGroupsToSave = newGroups.length;
    // save groups one at a time because we need to save in this order so parents are saved before children
    for (let i = 0; i < newGroups.length; i++) {
      await newGroups[i].save();
      this.currentGroupsSaved = i + 1;
    }
    this.savedGroup = newGroups[0];
  });

  async getCoursesForGroupWithSubgroupName(prefix, learnerGroup) {
    const offerings = await learnerGroup.offerings;
    const ilms = await learnerGroup.ilmSessions;
    const arr = [].concat(offerings, ilms);
    const sessions = await Promise.all(mapBy(arr, 'session'));
    const filteredSessions = uniqueValues(sessions.filter(Boolean));
    const courses = await Promise.all(mapBy(filteredSessions, 'course'));
    const courseObjects = courses.map((course) => {
      const obj = {
        id: course.id,
        courseTitle: course.title,
        groups: [],
        course,
      };
      if (prefix) {
        obj.groups.push(`${prefix}>${learnerGroup.title}`);
      }
      return obj;
    });
    const children = await learnerGroup.children;
    const childCourses = await map(children, async (child) => {
      return await this.getCoursesForGroupWithSubgroupName(learnerGroup.title, child);
    });
    const comb = [...courseObjects, ...childCourses.flat()];
    return comb.reduce((arr, obj) => {
      let courseObj = findById(arr, obj.id);
      if (!courseObj) {
        courseObj = {
          id: obj.id,
          courseTitle: obj.courseTitle,
          groups: [],
          course: obj.course,
        };
        arr.push(courseObj);
      }
      courseObj.groups = [...courseObj.groups, ...obj.groups];
      uniqueValues(courseObj.groups);
      return arr;
    }, []);
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }
  <template>
    {{#if @learnerGroup.allParents}}
      {{#each (reverse @learnerGroup.allParents) as |parent|}}
        {{pageTitle " | " parent.title prepend=false}}
      {{/each}}
      {{pageTitle " | " @learnerGroup.title prepend=false}}
    {{else}}
      {{pageTitle " | " @learnerGroup.title prepend=false}}
    {{/if}}

    {{#let (uniqueId) as |templateId|}}
      <section class="learner-group-root" data-test-learner-group-root ...attributes>
        {{#if this.isSavingGroups}}
          <WaitSaving
            @showProgress={{true}}
            @totalProgress={{this.totalGroupsToSave}}
            @currentProgress={{this.currentGroupsSaved}}
          />
        {{/if}}
        <Header
          @learnerGroup={{@learnerGroup}}
          @sortUsersBy={{this.sortUsersBy}}
          @canUpdate={{@canUpdate}}
        />
        <section class="learner-group-overview" data-test-overview>
          <div class="block" data-test-needs-accommodation>
            <label>{{t "general.accommodationIsRequiredForLearnersInThisGroup"}}:</label>
            <span>
              {{#if @canUpdate}}
                <ToggleYesno
                  @yes={{@learnerGroup.needsAccommodation}}
                  @toggle={{perform this.changeNeedsAccommodation}}
                />
              {{else}}
                {{#if @learnerGroup.needsAccommodation}}
                  <span class="add">{{t "general.yes"}}</span>
                {{else}}
                  <span class="remove">{{t "general.no"}}</span>
                {{/if}}
              {{/if}}
            </span>
          </div>
          <div class="block defaultlocation" data-test-location>
            <label for="location-{{templateId}}">
              {{t "general.defaultLocation"}}:
            </label>
            <span>
              {{#if @canUpdate}}
                <EditableField
                  @value={{if
                    @learnerGroup.location
                    @learnerGroup.location
                    (t "general.clickToEdit")
                  }}
                  @save={{perform this.changeLocation}}
                  @close={{this.revertLocationChanges}}
                  @saveOnEnter={{true}}
                  @closeOnEscape={{true}}
                  as |isSaving|
                >
                  <input
                    id="location-{{templateId}}"
                    type="text"
                    value={{this.location}}
                    disabled={{isSaving}}
                    {{on "input" (pick "target.value" (set this "locationBuffer"))}}
                  />
                </EditableField>
              {{else if @learnerGroup.location}}
                {{@learnerGroup.location}}
              {{else}}
                {{t "general.none"}}
              {{/if}}
            </span>
          </div>
          <div class="block defaulturl" data-test-url>
            <label for="link-{{templateId}}">
              {{t "general.defaultVirtualLearningLink"}}:
            </label>
            <span>
              {{#if @canUpdate}}
                <EditableField
                  @value={{if @learnerGroup.url @learnerGroup.url (t "general.clickToEdit")}}
                  @save={{perform this.saveUrlChanges}}
                  @close={{this.revertUrlChanges}}
                  @saveOnEnter={{true}}
                  @closeOnEscape={{true}}
                  as |isSaving|
                >
                  {{! template-lint-disable no-bare-strings}}
                  <input
                    id="link-{{templateId}}"
                    type="text"
                    placeholder="https://example.com"
                    value={{this.bestUrl}}
                    disabled={{isSaving}}
                    inputmode="url"
                    {{on "input" (pick "target.value" this.changeUrl)}}
                    {{on "focus" this.selectAllText}}
                    {{this.validations.attach "bestUrl"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.defaultVirtualLearningLink"}}
                    @validationErrors={{this.validations.errors.bestUrl}}
                    data-test-url-validation-error-message
                  />
                </EditableField>
              {{else if @learnerGroup.url}}
                {{@learnerGroup.url}}
              {{else}}
                {{t "general.none"}}
              {{/if}}
            </span>
          </div>
          <div class="block associatedcourses" data-test-courses>
            <label>
              {{t "general.associatedCourses"}}
              ({{this.courses.length}}):
            </label>
            <ul>
              {{#each (sortBy "courseTitle" this.courses) as |obj|}}
                <li>
                  <LinkTo @route="course" @model={{obj.course}}>
                    {{obj.courseTitle}}
                    {{#if this.academicYearCrossesCalendarYearBoundaries}}
                      ({{obj.course.year}}
                      -
                      {{add obj.course.year 1}})
                    {{else}}
                      ({{obj.course.year}})
                    {{/if}}
                  </LinkTo>
                </li>
              {{/each}}
            </ul>
          </div>
          {{#if (and this.dataForInstructorGroupManagerLoaded this.isManagingInstructors)}}
            <InstructorManager
              @learnerGroup={{@learnerGroup}}
              @instructors={{this.instructors}}
              @instructorGroups={{this.instructorGroups}}
              @availableInstructorGroups={{this.availableInstructorGroups}}
              @save={{perform this.saveInstructors}}
              @cancel={{set this "isManagingInstructors" false}}
            />
          {{else}}
            <InstructorsList
              @learnerGroup={{@learnerGroup}}
              @canUpdate={{@canUpdate}}
              @manage={{set this "isManagingInstructors" true}}
            />
          {{/if}}
          <div class="learner-group-overview-actions" data-test-overview-actions>
            <div class="title" data-test-title>
              {{#if @isEditing}}
                {{t "general.manageGroupMembership"}}
              {{else if @isBulkAssigning}}
                {{t "general.uploadGroupAssignments"}}
              {{else}}
                {{t "general.members"}}
                ({{this.usersForMembersList.length}})
              {{/if}}
            </div>
            <span class="actions" data-test-buttons>
              <input
                type="text"
                value={{this.filter}}
                placeholder={{t "general.filterByNameOrEmail"}}
                aria-label={{t "general.filterByNameOrEmail"}}
                {{on "input" (pick "target.value" (set this "filter"))}}
                data-test-filter
              />
              {{#if (or @isEditing @isBulkAssigning)}}
                <button
                  class="close"
                  type="button"
                  {{on "click" (pipe (fn @setIsEditing false) (fn @setIsBulkAssigning false))}}
                  data-test-close
                >
                  {{t "general.close"}}
                </button>
              {{else}}
                <ToggleButtons
                  @firstOptionSelected={{not this.showLearnerGroupCalendar}}
                  @firstLabel={{t "general.hideCalendar"}}
                  @secondLabel={{t "general.showCalendar"}}
                  @toggle={{toggle "showLearnerGroupCalendar" this}}
                />
                {{#if @canUpdate}}
                  <button
                    class="bulk-assign"
                    type="button"
                    data-test-activate-bulk-assign
                    {{on "click" (fn @setIsBulkAssigning true)}}
                  >
                    {{t "general.uploadGroupAssignments"}}
                  </button>
                  <button
                    class="manage"
                    type="button"
                    data-test-manage
                    {{on "click" (fn @setIsEditing true)}}
                  >
                    {{t "general.manage"}}
                  </button>
                {{/if}}
              {{/if}}
            </span>
          </div>
          {{#if @isBulkAssigning}}
            <BulkAssignment
              @learnerGroup={{@learnerGroup}}
              @done={{fn @setIsBulkAssigning false}}
            />
          {{else if @isEditing}}
            <div class="learner-group-overview-content">
              <UserManager
                @filter={{this.filter}}
                @learnerGroupId={{this.learnerGroupId}}
                @learnerGroupTitle={{this.learnerGroupTitle}}
                @topLevelGroupTitle={{this.topLevelGroupTitle}}
                @cohortTitle={{this.cohortTitle}}
                @users={{this.usersForUserManager}}
                @sortBy={{this.sortUsersBy}}
                @setSortBy={{@setSortUsersBy}}
                @addUserToGroup={{perform this.addUserToGroup}}
                @removeUserFromGroup={{perform this.removeUserToCohort}}
                @addUsersToGroup={{perform this.addUsersToGroup}}
                @removeUsersFromGroup={{perform this.removeUsersToCohort}}
              />
            </div>
          {{else}}
            {{#if this.showLearnerGroupCalendar}}
              <Calendar @learnerGroup={{@learnerGroup}} />
            {{/if}}
            <div class="learner-group-overview-content">
              <Members
                @filter={{this.filter}}
                @learnerGroupId={{this.learnerGroupId}}
                @setSortBy={{@setSortUsersBy}}
                @sortBy={{this.sortUsersBy}}
                @users={{this.usersForMembersList}}
              />
            </div>
          {{/if}}
          <section class="subgroups" data-test-subgroups>
            <div class="header">
              <h2 class="title">
                {{t "general.subgroups"}}
                ({{this.learnerGroups.length}})
              </h2>
              <div class="actions">
                {{#if @canCreate}}
                  <ExpandCollapseButton
                    @value={{this.showNewLearnerGroupForm}}
                    @action={{set
                      this
                      "showNewLearnerGroupForm"
                      (not this.showNewLearnerGroupForm)
                    }}
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
                  @generateNewLearnerGroups={{this.generateNewLearnerGroups}}
                  @multiModeSupported={{true}}
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
            <div class="list{{if (eq @learnerGroup.childrenCount 0) ' empty'}}">
              {{#if @learnerGroup.childrenCount}}
                <List
                  @learnerGroups={{this.learnerGroups}}
                  @canCopyWithLearners={{false}}
                  @copyGroup={{perform this.copyGroup}}
                  @sortBy={{this.sortGroupsBy}}
                  @setSortBy={{set this "sortGroupsBy"}}
                />
              {{/if}}
            </div>
          </section>
          <section class="cohortmembers">
            <CohortUserManager
              @users={{this.usersForCohortManager}}
              @canUpdate={{@canUpdate}}
              @learnerGroupTitle={{this.learnerGroupTitle}}
              @sortBy={{this.sortUsersBy}}
              @setSortBy={{@setSortUsersBy}}
              @addUserToGroup={{perform this.addUserToGroup}}
              @addUsersToGroup={{perform this.addUsersToGroup}}
            />
          </section>
        </section>
      </section>
    {{/let}}
  </template>
}
