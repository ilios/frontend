import Component from '@ember/component';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Promise, all, map } = RSVP;

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
  }).enqueue(),
  removeUserToCohort: task(function * (user) {
    const topLevelGroup = yield this.get('learnerGroup').get('topLevelGroup');
    let groups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    yield all(groups.invoke('save'));
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
    this.set('isSaving', false);
  }).enqueue(),
  usersToPassToManager: computed('isEditing', 'learnerGroup.{topLevelGroup,users.[]}', 'treeGroups.[]', async function () {
    const isEditing = this.get('isEditing');
    const learnerGroup = this.get('learnerGroup');
    if (isEditing) {
      let topLevelGroup = await learnerGroup.get('topLevelGroup');
      let users = await topLevelGroup.get('users').toArray();
      let treeGroups = await this.get('treeGroups');

      return await map(users, async user => {
        let lowestGroupInTree = await user.getLowestMemberGroupInALearnerGroupTree(treeGroups);
        return ObjectProxy.create({
          content: user,
          lowestGroupInTree,
          //special sorting property
          lowestGroupInTreeTitle: lowestGroupInTree.get('title')
        });
      });
    } else {
      return await learnerGroup.get('usersOnlyAtThisLevel');
    }
  }),
  usersToPassToCohortManager: computed('learnerGroup.{topLevelGroup,allDescendantUsers.[]}', 'cohort.users.[]', async function () {
    const learnerGroup = this.get('learnerGroup');
    const cohort = await learnerGroup.get('cohort');
    const topLevelGroup = await learnerGroup.get('topLevelGroup');
    const currentUsers = await topLevelGroup.get('allDescendantUsers');
    const users = await cohort.get('users');

    let filteredUsers = users.filter(
      user => !currentUsers.includes(user)
    );

    return filteredUsers;
  }),
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
