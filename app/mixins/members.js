import Ember from 'ember';
import DS from 'ember-data';

const { computed, inject, Mixin, ObjectProxy, RSVP } = Ember;
const { all, Promise } = RSVP;
const { service } = inject;
const { PromiseArray, PromiseObject } = DS;

export default Mixin.create({
  store: service(),

  i18n: service(),

  cohort: null,
  topLevelGroup: null,
  members: [],
  showMoveToCohortOption: false,
  showMoveToTopLevelGroupOption: false,
  overrideCurrentGroupDisplay: false,
  saving: false,

  learnerGroupOptions: computed('cohort', 'topLevelGroup', 'topLevelGroup.allTreeGroups.[]', 'showMoveToCohortOption', 'showMoveToTopLevelGroupOption', 'cohort.learnerGroups.[]', function() {
    let defer = RSVP.defer();

    this.get('cohort').then((cohort) => {
      let options = [];

      if (this.get('showMoveToCohortOption')) {
        options.pushObject(Ember.Object.create({
          id: -1,
          title: this.get('i18n').t('learnerGroups.removeLearnerToCohort', {cohort: cohort.get('displayTitle')})
        }));
      }

      this.get('topLevelGroup').then((topLevelGroup) => {
        if (this.get('showMoveToTopLevelGroupOption')) {
          options.pushObject(Ember.Object.create({
            id: topLevelGroup.get('id'),
            title: this.get('i18n').t('learnerGroups.switchLearnerToGroup', {group: topLevelGroup.get('allParentsTitle') + ' ' + topLevelGroup.get('title')})
          }));
        }

        topLevelGroup.get('allDescendants').then((groups) => {
          let objs = groups.map((group) => {
            return Ember.Object.create({
              id: group.get('id'),
              title: this.get('i18n').t('learnerGroups.switchLearnerToGroup', {group: group.get('allParentsTitle') + ' ' + group.get('title')}),
              sortTitle: group.get('sortTitle')
            });
          }).sortBy('sortTitle');

          options.pushObjects(objs);
          defer.resolve(options);
        });
      });
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  proxiedMembers: computed('members.[]', 'topLevelGroup', 'topLevelGroup.allDescendants.[]', function() {
    let defer = RSVP.defer();

    let userProxy = ObjectProxy.extend({
      treeGroups: [],

      overrideCurrentGroupDisplay: false,

      lowestGroupInTree: computed('content.learnerGroups.[]', 'treeGroups.[]', function(){
        let promise = new Promise((resolve) => {
          this.get('content.learnerGroups').then((userGroups) => {
            let treeGroups = userGroups.filter(group => this.get('treeGroups').contains(group));
            let deepestGroup, promises = [];

            treeGroups.forEach((group) => {
              let promise = group.get('children').then((children) => {
                let matchingChildren = children.filter(childGroup => treeGroups.contains(childGroup));

                if (matchingChildren.length === 0) {
                  deepestGroup = group;
                }
              });

              promises.pushObject(promise);
            });

            all(promises).then(()=>{
              resolve(deepestGroup);
            });
          });
        });

        return PromiseObject.create({ promise });
      }),

      groupDisplayValueString: computed('lowestGroupInTree.title', 'lowestGroupInTree.allParentsTitle', 'overrideCurrentGroupDisplay', function(){
        if (this.get('overrideCurrentGroupDisplay')) {
          return this.get('overrideCurrentGroupDisplay');
        }

        let group = this.get('lowestGroupInTree');

        return `${group.get('allParentsTitle')}${group.get('title')}`;
      })
    });

    let topLevelGroup = this.get('topLevelGroup');

    if (topLevelGroup) {
      topLevelGroup.then((topLevelGroup) => {
        let treeGroups = [];

        treeGroups.pushObject(topLevelGroup);

        topLevelGroup.get('allDescendants').then((all) => {
          treeGroups.pushObjects(all);

          let proxiedUsers = this.get('members').map((user) => {
            return userProxy.create({
              content: user,
              treeGroups: treeGroups,
              overrideCurrentGroupDisplay: this.get('overrideCurrentGroupDisplay')
            });
          });

          defer.resolve(proxiedUsers);
        });
      });
    } else {
      defer.resolve([]);
    }

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  sendPutRequests(groupIdString, userId) {
    const groupId = parseInt(groupIdString);
    const toSave = [];
    const store = this.get('store');
    const user = store.peekRecord('user', userId);

    return new Promise((resolve) => {
      this.get('topLevelGroup').then((topLevelGroup) => {
        topLevelGroup.removeUserFromGroupAndAllDescendants(user).then((groups) => {
          toSave.pushObjects(groups);
          if (groupId === -1) {
            resolve(toSave);
          } else {
            const learnerGroup = store.peekRecord('learnerGroup', groupId);

            learnerGroup.addUserToGroupAndAllParents(user).then((groups) =>{
              toSave.pushObjects(groups);
              resolve(toSave);
            });
          }
        });
      });
    });
  }
});
