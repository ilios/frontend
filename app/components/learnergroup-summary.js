import Ember from 'ember';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, RSVP, isPresent, computed, ObjectProxy } = Ember;
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
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('showUserManagerLoader', true);
    const learnerGroup = this.get('learnerGroup');
    if (isPresent(learnerGroup)) {
      this.set('location', learnerGroup.get('location'));
      this.set('learnerGroupId', learnerGroup.get('id'));
      this.set('learnerGroupTitle', learnerGroup.get('title'));
      learnerGroup.get('cohort').then(cohort => {
        this.set('cohortTitle', cohort.get('title'));
      });
      this.get('usersToPassToManager').perform();
    }
  },
  addUserToGroup: task(function * (user) {
    const learnerGroup = this.get('learnerGroup');
    const topLevelGroup = yield learnerGroup.get('topLevelGroup');
    let removeGroups = yield topLevelGroup.removeUserFromGroupAndAllDescendants(user);
    let addGroups = yield learnerGroup.addUserToGroupAndAllParents(user);
    let groups = [].concat(removeGroups).concat(addGroups);
    yield all(groups.invoke('save'));
    this.get('usersToPassToManager').perform();
  }).enqueue(),
  removeUserFromGroup: task(function * (user) {
    const learnerGroup = this.get('learnerGroup');
    let groups = yield learnerGroup.removeUserFromGroupAndAllDescendants(user);
    yield all(groups.invoke('save'));
    this.get('usersToPassToManager').perform();
  }).enqueue(),
  usersToPassToManager: task(function * () {
    const isEditing = this.get('isEditing');
    const learnerGroup = this.get('learnerGroup');
    if (isEditing) {
      let topLevelGroup = yield learnerGroup.get('topLevelGroup');
      let users = yield topLevelGroup.get('users');
      let treeGroups = yield this.get('treeGroups');
      let proxiedUsers = users.map(user => {
        return ObjectProxy.create({
          content: user,
          lowestGroupInTree: user.getLowestMemberGroupInALearnerGroupTree(treeGroups)
        });
      });

      this.set('showUserManagerLoader', false);
      return proxiedUsers;
    } else {
      let users = yield learnerGroup.get('usersOnlyAtThisLevel');

      this.set('showUserManagerLoader', false);
      return users;
    }
  }),
  showUserManagerLoader: false,
  learnerGroup: null,
  learnerGroupId: null,
  learnerGroupTitle: null,
  cohortTitle: null,
  classNames: ['detail-view', 'learnergroup-detail-view'],
  tagName: 'section',
  location: null,
  manageInstructors: false,
  isEditing: false,
  treeGroups: computed('learnerGroup.topLevelGroup.allDescendants.[]', function(){
    const learnerGroup = this.get('learnerGroup');
    return new Promise(resolve => {
      learnerGroup.get('topLevelGroup').then(topLevelGroup => {
        let treeGroups = [];
        treeGroups.pushObject(topLevelGroup);
        topLevelGroup.get('allDescendants').then((all) => {
          treeGroups.pushObjects(all);
          resolve(treeGroups);
        });
      });
    });
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
