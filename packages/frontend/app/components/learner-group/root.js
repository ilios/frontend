import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
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
  @tracked cohortTitle = null;
  @tracked learnerGroupId = null;
  @tracked learnerGroupTitle = null;
  @tracked location = null;
  @IsURL() @Length(2, 2000) @tracked url = null;
  @tracked topLevelGroupTitle = null;
  @tracked showLearnerGroupCalendar = false;
  @tracked courses = [];
  @tracked treeGroups = [];
  @tracked usersToPassToManager = [];
  @tracked usersToPassToCohortManager = [];
  @tracked sortGroupsBy = 'title';
  @tracked isSavingGroups = false;
  @tracked savedGroup;
  @tracked showNewLearnerGroupForm = false;
  @tracked currentGroupsSaved = 0;
  @tracked totalGroupsToSave = 0;
  @service iliosConfig;

  load = restartableTask(async (element, [learnerGroup]) => {
    if (isPresent(learnerGroup)) {
      this.location = learnerGroup.location;
      this.url = learnerGroup.url;
      this.learnerGroupId = learnerGroup.id;
      this.learnerGroupTitle = learnerGroup.title;
      const cohort = await learnerGroup.cohort;
      this.cohortTitle = cohort.title;
      const topLevelGroup = await learnerGroup.getTopLevelGroup();
      this.topLevelGroupTitle = topLevelGroup.title;
      const allDescendants = await topLevelGroup.getAllDescendants();
      this.treeGroups = [topLevelGroup, ...allDescendants];
      this.usersToPassToManager = await this.createUsersToPassToManager.perform();
      this.usersToPassToCohortManager = await this.createUsersToPassToCohortManager.perform();
      this.courses = await this.getCoursesForGroupWithSubgroupName(null, this.args.learnerGroup);
    }
  });

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

  @action
  saveInstructors(newInstructors, newInstructorGroups) {
    this.args.learnerGroup.set('instructors', newInstructors);
    this.args.learnerGroup.set('instructorGroups', newInstructorGroups);
    return this.args.learnerGroup.save();
  }

  addUserToGroup = enqueueTask(async (user) => {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = await learnerGroup.topLevelGroup;
    const removeGroups = await topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    const addGroups = await learnerGroup.addUserToGroupAndAllParents(user);
    await Promise.all(removeGroups.map((g) => g.save()));
    await Promise.all(addGroups.map((g) => g.save()));
    this.usersToPassToManager = await this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = await this.createUsersToPassToCohortManager.perform();
  });

  removeUserToCohort = enqueueTask(async (user) => {
    const topLevelGroup = await this.args.learnerGroup.topLevelGroup;
    const groups = await topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    await all(groups.map((group) => group.save()));
    this.usersToPassToManager = await this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = await this.createUsersToPassToCohortManager.perform();
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

    this.usersToPassToManager = await this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = await this.createUsersToPassToCohortManager.perform();
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
    this.usersToPassToManager = await this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = await this.createUsersToPassToCohortManager.perform();
  });

  createUsersToPassToManager = task(async () => {
    let users;
    if (this.args.isEditing) {
      const topLevelGroup = await this.args.learnerGroup.getTopLevelGroup();
      users = await topLevelGroup.getAllDescendantUsers();
    } else {
      users = await this.args.learnerGroup.getUsersOnlyAtThisLevel();
    }
    return await map(users, async (user) => {
      const lowestGroupInTree = await user.getLowestMemberGroupInALearnerGroupTree(this.treeGroups);
      return ObjectProxy.create({
        content: user,
        lowestGroupInTree,
        //special sorting property
        lowestGroupInTreeTitle: lowestGroupInTree.title,
      });
    });
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
