import Component from '@ember/component';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Promise, all } = RSVP;

const Validations = buildValidations({
  location: [
    validator('length', {
      allowBlank: true,
      min: 2,
      max: 100
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {

  showUserManagerLoader: false,
  showCohortManagerLoader: false,
  learnerGroup: null,
  learnerGroupId: null,
  learnerGroupTitle: null,
  cohortTitle: null,
  topLevelGroupTitle: null,
  classNames: ['learnergroup-summary'],
  tagName: 'section',
  location: null,
  manageInstructors: false,
  isEditing: false,
  isSaving: false,
  sortUsersBy: '',
  totalGroupsToSave: 0,
  currentGroupsSaved: 0,
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('showUserManagerLoader', true);
    this.set('showCohortManagerLoader', true);
    const learnerGroup = this.get('learnerGroup');
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
      this.get('usersToPassToManager').perform();
      this.get('usersToPassToCohortManager').perform();
    }
  },
  treeGroups: computed('learnerGroup.topLevelGroup.allDescendants.[]', function(){
    const learnerGroup = this.get('learnerGroup');
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
  saveSomeGroups(arr){
    let chunk = arr.splice(0, 5);
    return all(chunk.invoke('save')).then(() => {
      if (arr.length){
        this.set('currentGroupsSaved', this.get('currentGroupsSaved') + chunk.length);
        return this.saveSomeGroups(arr);
      }
    });
  },
  addUserToGroup: task(function * (user) {
    const learnerGroup = this.get('learnerGroup');
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    let removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    let addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
    let groups = [].concat(removeGroups).concat(addGroups);
    yield all(groups.invoke('save'));
    yield this.get('usersToPassToManager').perform();
    yield this.get('usersToPassToCohortManager').perform();
  }).enqueue(),
  removeUserToCohort: task(function * (user) {
    const topLevelGroup = yield this.get('learnerGroup').get('topLevelGroup');
    let groups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    yield all(groups.invoke('save'));
    yield this.get('usersToPassToManager').perform();
    yield this.get('usersToPassToCohortManager').perform();
  }).enqueue(),
  addUsersToGroup: task(function * (users) {
    const learnerGroup = this.get('learnerGroup');
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      let addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
      groupsToSave.pushObjects(removeGroups);
      groupsToSave.pushObjects(addGroups);
    }
    this.set('totalGroupsToSave', groupsToSave.uniq().length);
    this.set('isSaving', true);
    yield this.saveSomeGroups(groupsToSave.uniq());
    this.set('isSaving', false);
    this.set('totalGroupsToSave', 0);
    this.set('currentGroupsSaved', 0);

    yield this.get('usersToPassToManager').perform();
    yield this.get('usersToPassToCohortManager').perform();
    this.set('isSaving', false);
  }).enqueue(),
  removeUsersToCohort: task(function * (users) {
    const topLevelGroup = yield this.get('learnerGroup').get('topLevelGroup');
    let groupsToSave = [];
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
      groupsToSave.pushObjects(removeGroups);
    }

    this.set('totalGroupsToSave', groupsToSave.uniq().length);
    this.set('isSaving', true);
    yield this.saveSomeGroups(groupsToSave.uniq());
    this.set('isSaving', false);
    this.set('totalGroupsToSave', 0);
    this.set('currentGroupsSaved', 0);

    yield this.get('usersToPassToManager').perform();
    yield this.get('usersToPassToCohortManager').perform();
    this.set('isSaving', false);
  }).enqueue(),
  usersToPassToManager: task(function * () {
    const isEditing = this.get('isEditing');
    const learnerGroup = this.get('learnerGroup');
    if (isEditing) {
      let topLevelGroup = yield learnerGroup.get('topLevelGroup');
      let users = yield topLevelGroup.get('users').toArray();
      let treeGroups = yield this.get('treeGroups');

      let proxiedUsers = [];
      for (let i = 0; i < users.length; i++){
        const user = users[i];
        let lowestGroupInTree = yield user.getLowestMemberGroupInALearnerGroupTree(treeGroups);
        let userProxy = ObjectProxy.create({
          content: user,
          lowestGroupInTree,
          //special sorting property
          lowestGroupInTreeTitle: lowestGroupInTree.get('title')
        });
        proxiedUsers.pushObject(userProxy);
      }

      this.set('showUserManagerLoader', false);
      return proxiedUsers;
    } else {
      let users = yield learnerGroup.get('usersOnlyAtThisLevel');

      this.set('showUserManagerLoader', false);
      return users;
    }
  }).enqueue(),
  usersToPassToCohortManager: task(function * () {
    const learnerGroup = this.get('learnerGroup');
    const cohort = yield learnerGroup.get('cohort');
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    const currentUsers = yield topLevelGroup.get('allDescendantUsers');
    const users = yield cohort.get('users');

    let filteredUsers = users.filter(
      user => !currentUsers.includes(user)
    );

    this.set('showCohortManagerLoader', false);
    return filteredUsers;
  }).enqueue(),
  actions: {
    changeLocation() {
      const newLocation = this.get('location');
      const learnerGroup = this.get('learnerGroup');
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
    revertLocationChanges(){
      const learnerGroup = this.get('learnerGroup');
      this.set('location', learnerGroup.get('location'));
    },
    saveInstructors(newInstructors, newInstructorGroups){
      const learnerGroup = this.get('learnerGroup');
      learnerGroup.set('instructors', newInstructors.toArray());
      learnerGroup.set('instructorGroups', newInstructorGroups.toArray());
      this.set('manageInstructors', false);
      return learnerGroup.save();
    }
  }
});
