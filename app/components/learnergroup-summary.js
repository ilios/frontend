import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { isPresent } from '@ember/utils';
import { all, map, reject } from 'rsvp';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  location: [
    validator('length', {
      allowBlank: true,
      min: 2,
      max: 100
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  tagName: "",
  canCreate: false,
  canDelete: false,
  canUpdate: false,
  cohortTitle: null,
  currentGroupsSaved: 0,
  isBulkAssigning: false,
  isEditing: false,
  isSaving: false,
  learnerGroup: null,
  learnerGroupId: null,
  learnerGroupTitle: null,
  location: null,
  manageInstructors: false,
  sortUsersBy: '',
  topLevelGroupTitle: null,
  totalGroupsToSave: 0,

  treeGroups: computed('learnerGroup.topLevelGroup.allDescendants.[]', async function() {
    const topLevelGroup = await this.learnerGroup.topLevelGroup;
    const treeGroups = [topLevelGroup];
    const allDescendants = await topLevelGroup.allDescendants;
    treeGroups.pushObjects(allDescendants);
    return treeGroups;
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    const learnerGroup = this.learnerGroup;
    if (isPresent(learnerGroup)) {
      this.set('location', learnerGroup.get('location'));
      this.set('learnerGroupId', learnerGroup.get('id'));
      this.set('learnerGroupTitle', learnerGroup.get('title'));
      learnerGroup.get('cohort').then(cohort => {
        this.set('cohortTitle', cohort.get('title'));
      });
      learnerGroup.get('topLevelGroup').then(topLevelGroup => {
        this.set('topLevelGroupTitle', topLevelGroup.get('title'));
      });
      this.createUsersToPassToManager.perform();
      this.createUsersToPassToCohortManager.perform();
    }
  },

  actions: {
    async changeLocation() {
      const learnerGroup = this.learnerGroup;
      const newLocation = this.location;
      this.send('addErrorDisplayFor', 'location');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'location');
        learnerGroup.set('location', newLocation);
        const newLearnerGroup = await learnerGroup.save();
        this.set('location', newLearnerGroup.location);
        this.set('learnerGroup', newLearnerGroup);
      } else {
        await reject();
      }
    },

    revertLocationChanges() {
      const learnerGroup = this.learnerGroup;
      this.set('location', learnerGroup.get('location'));
    },

    saveInstructors(newInstructors, newInstructorGroups) {
      const learnerGroup = this.learnerGroup;
      learnerGroup.set('instructors', newInstructors.toArray());
      learnerGroup.set('instructorGroups', newInstructorGroups.toArray());
      this.set('manageInstructors', false);
      return learnerGroup.save();
    },

    manageInstructors() {
      const canUpdate = this.canUpdate;
      const manageInstructors = this.manageInstructors;
      if (canUpdate) {
        this.set('manageInstructors', !manageInstructors);
      }
    }
  },

  addUserToGroup: task(function* (user) {
    const learnerGroup = this.learnerGroup;
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    const addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
    const groups = [].concat(removeGroups).concat(addGroups);
    yield all(groups.invoke('save'));
    yield this.createUsersToPassToManager.perform();
    yield this.createUsersToPassToCohortManager.perform();
  }).enqueue(),

  removeUserToCohort: task(function* (user) {
    const topLevelGroup = yield this.learnerGroup.get('topLevelGroup');
    const groups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    yield all(groups.invoke('save'));
    yield this.createUsersToPassToManager.perform();
    yield this.createUsersToPassToCohortManager.perform();
  }).enqueue(),

  addUsersToGroup: task(function* (users) {
    const learnerGroup = this.learnerGroup;
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    const groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      const addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
      groupsToSave.pushObjects(removeGroups);
      groupsToSave.pushObjects(addGroups);
    }
    yield all(groupsToSave.uniq().invoke('save'));
    yield this.createUsersToPassToManager.perform();
    yield this.createUsersToPassToCohortManager.perform();
  }).enqueue(),

  removeUsersToCohort: task(function* (users) {
    const topLevelGroup = yield this.learnerGroup.get('topLevelGroup');
    const groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      groupsToSave.pushObjects(removeGroups);
    }
    yield all(groupsToSave.uniq().invoke('save'));
    yield this.createUsersToPassToManager.perform();
    yield this.createUsersToPassToCohortManager.perform();
  }).enqueue(),

  createUsersToPassToManager: task(function* () {
    const isEditing = this.isEditing;
    const learnerGroup = this.learnerGroup;
    let users;
    if (isEditing) {
      const topLevelGroup = yield learnerGroup.get('topLevelGroup');
      users = yield topLevelGroup.get('allDescendantUsers');
    } else {
      users = yield learnerGroup.get('usersOnlyAtThisLevel');
    }
    const treeGroups = yield this.treeGroups;
    return yield map(users.toArray(), async user => {
      const lowestGroupInTree = await user.getLowestMemberGroupInALearnerGroupTree(treeGroups);
      return ObjectProxy.create({
        content: user,
        lowestGroupInTree,
        //special sorting property
        lowestGroupInTreeTitle: lowestGroupInTree.get('title')
      });
    });
  }),

  createUsersToPassToCohortManager: task(function* () {
    const learnerGroup = this.learnerGroup;
    const cohort = yield learnerGroup.get('cohort');
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    const currentUsers = yield topLevelGroup.get('allDescendantUsers');
    const users = yield cohort.get('users');
    const filteredUsers = users.filter(
      user => !currentUsers.includes(user)
    );
    return filteredUsers;
  })
});
