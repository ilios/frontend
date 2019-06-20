import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { isPresent } from '@ember/utils';
import { Promise, all, map } from 'rsvp';
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
  classNames: ['learnergroup-summary'],
  tagName: 'section',

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

  treeGroups: computed('learnerGroup.topLevelGroup.allDescendants.[]', function() {
    const learnerGroup = this.learnerGroup;
    return new Promise(resolve => {
      learnerGroup.get('topLevelGroup').then(topLevelGroup => {
        let treeGroups = [];
        treeGroups.pushObject(topLevelGroup);
        topLevelGroup.get('allDescendants').then(allDescendants => {
          treeGroups.pushObjects(allDescendants);
          resolve(treeGroups);
        });
      });
    });
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
    changeLocation() {
      const newLocation = this.location;
      const learnerGroup = this.learnerGroup;
      this.send('addErrorDisplayFor', 'location');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'location');
            learnerGroup.set('location', newLocation);
            learnerGroup.save().then((newLearnerGroup) => {
              this.set('location', newLearnerGroup.get('location'));
              this.set('learnerGroup', newLearnerGroup);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
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
    let removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    let addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
    let groups = [].concat(removeGroups).concat(addGroups);
    yield all(groups.invoke('save'));
    yield this.createUsersToPassToManager.perform();
    yield this.createUsersToPassToCohortManager.perform();
  }).enqueue(),

  removeUserToCohort: task(function* (user) {
    const topLevelGroup = yield this.learnerGroup.get('topLevelGroup');
    let groups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    yield all(groups.invoke('save'));
    yield this.createUsersToPassToManager.perform();
    yield this.createUsersToPassToCohortManager.perform();
  }).enqueue(),

  addUsersToGroup: task(function* (users) {
    const learnerGroup = this.learnerGroup;
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      let addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
      groupsToSave.pushObjects(removeGroups);
      groupsToSave.pushObjects(addGroups);
    }
    yield all(groupsToSave.uniq().invoke('save'));
    yield this.createUsersToPassToManager.perform();
    yield this.createUsersToPassToCohortManager.perform();
  }).enqueue(),

  removeUsersToCohort: task(function* (users) {
    const topLevelGroup = yield this.learnerGroup.get('topLevelGroup');
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
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
      let topLevelGroup = yield learnerGroup.get('topLevelGroup');
      users = yield topLevelGroup.get('allDescendantUsers');
    } else {
      users = yield learnerGroup.get('usersOnlyAtThisLevel');
    }
    const treeGroups = yield this.treeGroups;
    return yield map(users.toArray(), async user => {
      let lowestGroupInTree = await user.getLowestMemberGroupInALearnerGroupTree(treeGroups);
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
    let filteredUsers = users.filter(
      user => !currentUsers.includes(user)
    );
    return filteredUsers;
  })
});
