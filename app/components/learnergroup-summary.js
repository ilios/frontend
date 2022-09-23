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

  @restartableTask
  *load(element, [learnerGroup]) {
    if (isPresent(learnerGroup)) {
      this.location = learnerGroup.location;
      this.url = learnerGroup.url;
      this.learnerGroupId = learnerGroup.id;
      this.learnerGroupTitle = learnerGroup.title;
      const cohort = yield learnerGroup.cohort;
      this.cohortTitle = cohort.title;
      const topLevelGroup = yield learnerGroup.getTopLevelGroup();
      this.topLevelGroupTitle = topLevelGroup.title;
      const allDescendants = yield topLevelGroup.getAllDescendants();
      this.treeGroups = [topLevelGroup, ...allDescendants];
      this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
      this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
      this.courses = yield this.getCoursesForGroupWithSubgroupName(null, this.args.learnerGroup);
    }
  }

  @restartableTask
  *changeLocation() {
    this.addErrorDisplayFor('location');
    const isValid = yield this.isValid('location');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('location');
    this.args.learnerGroup.set('location', this.location);
    yield this.args.learnerGroup.save();
    this.location = this.args.learnerGroup.location;
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

  @restartableTask
  *saveUrlChanges() {
    this.addErrorDisplayFor('url');
    const isValid = yield this.isValid('url');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('url');
    this.args.learnerGroup.set('url', this.url);
    yield this.args.learnerGroup.save();
    this.url = this.args.learnerGroup.url;
  }

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

  @enqueueTask
  *addUserToGroup(user) {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = yield learnerGroup.topLevelGroup;
    const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    const addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
    const groups = [].concat(removeGroups).concat(addGroups);
    yield all(groups.map((group) => group.save()));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @enqueueTask
  *removeUserToCohort(user) {
    const topLevelGroup = yield this.args.learnerGroup.topLevelGroup;
    const groups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    yield all(groups.map((group) => group.save()));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @enqueueTask
  *addUsersToGroup(users) {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = yield learnerGroup.topLevelGroup;
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      const addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
      groupsToSave = [...groupsToSave, ...removeGroups, ...addGroups];
    }
    yield all(uniqueValues(groupsToSave).map((group) => group.save()));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @enqueueTask
  *removeUsersToCohort(users) {
    const topLevelGroup = yield this.args.learnerGroup.topLevelGroup;
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      groupsToSave = [...groupsToSave, ...removeGroups];
    }
    yield all(uniqueValues(groupsToSave).map((group) => group.save()));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @task
  *createUsersToPassToManager() {
    let users;
    if (this.args.isEditing) {
      const topLevelGroup = yield this.args.learnerGroup.getTopLevelGroup();
      users = yield topLevelGroup.getAllDescendantUsers();
    } else {
      users = yield this.args.learnerGroup.getUsersOnlyAtThisLevel();
    }
    return yield map(users.slice(), async (user) => {
      const lowestGroupInTree = await user.getLowestMemberGroupInALearnerGroupTree(this.treeGroups);
      return ObjectProxy.create({
        content: user,
        lowestGroupInTree,
        //special sorting property
        lowestGroupInTreeTitle: lowestGroupInTree.title,
      });
    });
  }

  @task
  *createUsersToPassToCohortManager() {
    const learnerGroup = this.args.learnerGroup;
    const cohort = yield learnerGroup.cohort;
    const topLevelGroup = yield learnerGroup.getTopLevelGroup();
    const currentUsers = yield topLevelGroup.getAllDescendantUsers();
    const users = yield cohort.users;
    return users.filter((user) => !currentUsers.includes(user));
  }

  @restartableTask
  *changeNeedsAccommodation(value) {
    this.args.learnerGroup.set('needsAccommodation', value);
    yield this.args.learnerGroup.save();
  }

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
