import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { service } from '@ember/service';
import { all, map } from 'rsvp';
import { dropTask, enqueueTask, restartableTask, task } from 'ember-concurrency';
import pad from 'pad';
import { TrackedAsyncData } from 'ember-async-data';
import { Length, IsURL, validatable } from 'ilios-common/decorators/validation';
import { findById, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import cloneLearnerGroup from '../../utils/clone-learner-group';
import countDigits from '../../utils/count-digits';

const DEFAULT_URL_VALUE = 'https://';

@validatable
export default class LearnerGroupRootComponent extends Component {
  @service flashMessages;
  @service intl;
  @service store;
  @service iliosConfig;
  @tracked location = null;
  @IsURL() @Length(2, 2000) @tracked url = null;
  @tracked showLearnerGroupCalendar = false;
  @tracked sortGroupsBy = 'title';
  @tracked isSavingGroups = false;
  @tracked savedGroup;
  @tracked showNewLearnerGroupForm = false;
  @tracked currentGroupsSaved = 0;
  @tracked totalGroupsToSave = 0;
  @tracked isManagingInstructors = false;

  constructor() {
    super(...arguments);
    this.location = this.args.learnerGroup.location;
    this.url = this.args.learnerGroup.url;
  }

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
    this.addErrorDisplayFor('location');
    const isValid = await this.isValid('location');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('location');
    this.args.learnerGroup.set('location', this.location);
    await this.args.learnerGroup.save();
    this.location = this.args.learnerGroup.location;
  });

  @action
  async generateNewLearnerGroups(num) {
    this.savedGroup = null;
    this.currentGroupsSaved = 0;
    this.isSaving = true;
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
        this.isSaving = false;
        this.flashMessages.success('general.savedSuccessfully');
        this.showNewLearnerGroupForm = false;
      }
    };
    await saveSomeGroups(groups);
  }

  @action
  revertLocationChanges() {
    this.location = this.args.learnerGroup.location;
  }

  @action
  selectAllText({ target }) {
    if (target.value === DEFAULT_URL_VALUE) {
      target.select();
    }
  }

  saveUrlChanges = restartableTask(async () => {
    this.addErrorDisplayFor('url');
    const isValid = await this.isValid('url');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('url');
    this.args.learnerGroup.set('url', this.url);
    await this.args.learnerGroup.save();
    this.url = this.args.learnerGroup.url;
  });

  @action
  revertUrlChanges() {
    this.url = this.args.learnerGroup.url;
  }

  @action
  changeUrl(value) {
    value = value.trim();
    const regex = RegExp('https://http[s]?:');
    if (regex.test(value)) {
      value = value.substring(8);
    }
    this.url = value;
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
}
