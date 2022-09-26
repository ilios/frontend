import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { isPresent } from '@ember/utils';
import { all, map } from 'rsvp';
import { enqueueTask, restartableTask, task } from 'ember-concurrency';
import { Length, IsURL, validatable } from 'ilios-common/decorators/validation';
import { findById, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

const DEFAULT_URL_VALUE = 'https://';

@validatable
export default class LearnergroupSummaryComponent extends Component {
  @tracked cohortTitle = null;
  @tracked currentGroupsSaved = 0;
  @tracked learnerGroupId = null;
  @tracked learnerGroupTitle = null;
  @tracked location = null;
  @IsURL() @Length(2, 2000) @tracked url = null;
  @tracked topLevelGroupTitle = null;
  @tracked totalGroupsToSave = 0;
  @tracked showLearnerGroupCalendar = false;
  @tracked courses = [];
  @tracked treeGroups = [];
  @tracked usersToPassToManager = [];
  @tracked usersToPassToCohortManager = [];

  get bestUrl() {
    if (this.url || this.urlChanged) {
      return this.url;
    }

    return DEFAULT_URL_VALUE;
  }

  get sortUsersBy() {
    return this.args.sortUsersBy || 'fullName';
  }

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
    this.args.learnerGroup.set('instructors', newInstructors.slice());
    this.args.learnerGroup.set('instructorGroups', newInstructorGroups.slice());
    return this.args.learnerGroup.save();
  }

  addUserToGroup = enqueueTask(async (user) => {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = await learnerGroup.topLevelGroup;
    const removeGroups = await topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    const addGroups = await learnerGroup.addUserToGroupAndAllParents(user);
    const groups = [].concat(removeGroups).concat(addGroups);
    await all(groups.map((group) => group.save()));
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
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = await topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      const addGroups = await learnerGroup.addUserToGroupAndAllParents(user);
      groupsToSave = [...groupsToSave, ...removeGroups, ...addGroups];
    }
    await all(uniqueValues(groupsToSave).map((group) => group.save()));
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
    return await map(users.slice(), async (user) => {
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

  async getCoursesForGroupWithSubgroupName(prefix, learnerGroup) {
    const offerings = (await learnerGroup.offerings).slice();
    const ilms = (await learnerGroup.ilmSessions).slice();
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
    const children = (await learnerGroup.children).slice();
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
}
