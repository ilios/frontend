import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { isPresent } from '@ember/utils';
import { all, map } from 'rsvp';
import { enqueueTask, restartableTask, task } from 'ember-concurrency';
import { Length, IsURL, validatable } from 'ilios-common/decorators/validation';

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
      const topLevelGroup = yield learnerGroup.topLevelGroup;
      this.topLevelGroupTitle = topLevelGroup.title;
      const allDescendants = yield topLevelGroup.allDescendants;
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
    this.args.learnerGroup.set('instructors', newInstructors.toArray());
    this.args.learnerGroup.set('instructorGroups', newInstructorGroups.toArray());
    return this.args.learnerGroup.save();
  }

  @enqueueTask
  *addUserToGroup(user) {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = yield learnerGroup.topLevelGroup;
    const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    const addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
    const groups = [].concat(removeGroups).concat(addGroups);
    yield all(groups.invoke('save'));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @enqueueTask
  *removeUserToCohort(user) {
    const topLevelGroup = yield this.args.learnerGroup.topLevelGroup;
    const groups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    yield all(groups.invoke('save'));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @enqueueTask
  *addUsersToGroup(users) {
    const learnerGroup = this.args.learnerGroup;
    const topLevelGroup = yield learnerGroup.topLevelGroup;
    const groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      const addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
      groupsToSave.pushObjects(removeGroups);
      groupsToSave.pushObjects(addGroups);
    }
    yield all(groupsToSave.uniq().invoke('save'));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @enqueueTask
  *removeUsersToCohort(users) {
    const topLevelGroup = yield this.args.learnerGroup.topLevelGroup;
    const groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      groupsToSave.pushObjects(removeGroups);
    }
    yield all(groupsToSave.uniq().invoke('save'));
    this.usersToPassToManager = yield this.createUsersToPassToManager.perform();
    this.usersToPassToCohortManager = yield this.createUsersToPassToCohortManager.perform();
  }

  @task
  *createUsersToPassToManager() {
    let users;
    if (this.args.isEditing) {
      const topLevelGroup = yield this.args.learnerGroup.topLevelGroup;
      users = yield topLevelGroup.allDescendantUsers;
    } else {
      users = yield this.args.learnerGroup.usersOnlyAtThisLevel;
    }
    return yield map(users.toArray(), async (user) => {
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
    const topLevelGroup = yield learnerGroup.topLevelGroup;
    const currentUsers = yield topLevelGroup.allDescendantUsers;
    const users = yield cohort.users;
    return users.filter((user) => !currentUsers.includes(user));
  }

  @restartableTask
  *changeNeedsAccommodation(value) {
    this.args.learnerGroup.set('needsAccommodation', value);
    yield this.args.learnerGroup.save();
  }

  async getCoursesForGroupWithSubgroupName(prefix, learnerGroup) {
    const offerings = (await learnerGroup.offerings).toArray();
    const ilms = (await learnerGroup.ilmSessions).toArray();
    const arr = [].concat(offerings, ilms);
    const sessions = await Promise.all(arr.mapBy('session'));
    const filteredSessions = sessions.filter(Boolean).uniq();
    const courses = await Promise.all(filteredSessions.mapBy('course'));
    const courseObjects = courses.map((course) => {
      const obj = {
        id: course.id,
        courseTitle: course.title,
        groups: [],
      };
      if (prefix) {
        obj.groups.push(`${prefix}>${learnerGroup.title}`);
      }
      return obj;
    });
    const children = (await learnerGroup.children).toArray();
    const childCourses = await map(children, async (child) => {
      return await this.getCoursesForGroupWithSubgroupName(learnerGroup.title, child);
    });
    const comb = [...courseObjects, ...childCourses.flat()];
    return comb.reduce((arr, obj) => {
      let courseObj = arr.findBy('id', obj.id);
      if (!courseObj) {
        courseObj = {
          id: obj.id,
          courseTitle: obj.courseTitle,
          groups: [],
        };
        arr.push(courseObj);
      }
      courseObj.groups.pushObjects(obj.groups);
      courseObj.groups.uniq();
      return arr;
    }, []);
  }
}
