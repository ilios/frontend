import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const { computed, ObjectProxy, observer, RSVP, run } = Ember;
const { once } = run;
const { empty, not } = computed;
const { all, Promise } = RSVP;
const { PromiseArray, PromiseObject } = DS;

export default Ember.Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  classNames: ['learnergroup-members', 'form-container'],
  tagName: 'section',
  cohort: null,
  topLevelGroup: null,
  members: [],
  showMoveToCohortOption: false,
  showMoveToTopLevelGroupOption: false,
  overrideCurrentGroupDisplay: false,
  saving: false,
  learnerGroupOptions: function(){
    var defer = Ember.RSVP.defer();
    this.get('cohort').then(
      cohort => {
        var options = [];
        if(this.get('showMoveToCohortOption')){
          options.pushObject(Ember.Object.create({
            id: -1,
            title: this.get('i18n').t('learnerGroups.removeLearnerToCohort', {cohort: cohort.get('displayTitle')})
          }));
        }
        this.get('topLevelGroup').then(
          topLevelGroup => {
            if(this.get('showMoveToTopLevelGroupOption')){
              options.pushObject(Ember.Object.create({
                id: topLevelGroup.get('id'),
                title: this.get('i18n').t('learnerGroups.switchLearnerToGroup', {group: topLevelGroup.get('allParentsTitle') + ' ' + topLevelGroup.get('title')})
              }));
            }
            topLevelGroup.get('allDescendants').then(
              groups => {
                var objs = groups.map(
                  group => {
                    return Ember.Object.create({
                      id: group.get('id'),
                      title: this.get('i18n').t('learnerGroups.switchLearnerToGroup', {group: group.get('allParentsTitle') + ' ' + group.get('title')}),
                      sortTitle: group.get('sortTitle')
                    });
                  }
                ).sortBy('sortTitle');
                options.pushObjects(objs);
                defer.resolve(options);
              }
            );
          }
        );

      }
    );
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('cohort', 'topLevelGroup', 'topLevelGroup.allTreeGroups.@each', 'showMoveToCohortOption', 'showMoveToTopLevelGroupOption'),
  proxiedMembers: function(){
    var defer = Ember.RSVP.defer();

    let userProxy = Ember.ObjectProxy.extend({
      treeGroups: [],
      overrideCurrentGroupDisplay: false,
      lowestGroupInTree: function(){
        let promise = new Ember.RSVP.Promise(
          resolve => {
            this.get('content.learnerGroups').then(
              userGroups => {
                let treeGroups = userGroups.filter(group => this.get('treeGroups').contains(group));
                let deepestGroup, promises = [];
                treeGroups.forEach(group => {
                  let promise = group.get('children').then(children=>{
                    let matchingChildren = children.filter(childGroup => treeGroups.contains(childGroup));
                    if(matchingChildren.length === 0){
                      deepestGroup = group;
                    }
                  });
                  promises.pushObject(promise);
                });
                Ember.RSVP.all(promises).then(()=>{
                  resolve(deepestGroup);
                });
              }
            );
          }
        );
        return DS.PromiseObject.create({
          promise: promise
        });
      }.property('content.learnerGroups.@each', 'treeGroups.@each'),
      groupDisplayValueString: function(){
        if(this.get('overrideCurrentGroupDisplay')){
          return this.get('overrideCurrentGroupDisplay');
        }
        let group = this.get('lowestGroupInTree');
        return group.get('allParentsTitle') + '' + group.get('title');
      }.property('lowestGroupInTree.title', 'lowestGroupInTree.allParentsTitle', 'overrideCurrentGroupDisplay'),
    });
    let topLevelGroup = this.get('topLevelGroup');
    if(topLevelGroup){
      topLevelGroup.then(topLevelGroup => {
        let treeGroups = [];
        treeGroups.pushObject(topLevelGroup);
        topLevelGroup.get('allDescendants').then(all => {
          treeGroups.pushObjects(all);
          let proxiedUsers = this.get('members').map(user => {
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

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }.property('members.[]', 'topLevelGroup', 'topLevelGroup.allDescendants.@each'),

  sendPutRequests(groupIdString, userId) {
    this.set('saving', true);
    let groupId = parseInt(groupIdString);
    let toSave = [];
    let component = this;

    this.get('store').find('user', userId).then(
      (user) => {
        toSave.pushObject(user);
        component.get('topLevelGroup').then((topLevelGroup) => {
          topLevelGroup.removeUserFromGroupAndAllDescendants(user).then((groups) => {
            toSave.pushObjects(groups);
            if (groupId === -1) {
              // we're moving this user out of the group into the cohort
              // so just save
              all(toSave.uniq().invoke('save')).finally(() => {
                component.set('saving', false);
              });
            } else {
              component.get('store').find('learnerGroup', groupId).then(learnerGroup => {
                learnerGroup.addUserToGroupAndAllParents(user).then(groups =>{
                  toSave.pushObjects(groups);
                  all(toSave.uniq().invoke('save')).finally(() => {
                    component.set('saving', false);
                  });
                });
              });
            }
          });
        });
      }
    );
  },

  noneChecked: empty('toBulkSave'),
  someChecked: not('noneChecked'),

  resetProperties: observer('multiEditModeOn', function() {
    if (!this.get('multiEditModeOn')) {
      once(this, this.setProperties, { buffer: null, valueChanged: false });
    }
  }),

  buffer: null,
  valueChanged: false,
  includeAll: false,
  toBulkSave: [],
  optionLabelPath: 'title',
  optionValuePath: 'id',

  proxiedOptions: computed('learnerGroupOptions.@each', 'optionLabelPath', 'optionValuePath', function() {
    let options = this.get('learnerGroupOptions');

    let objectProxy = ObjectProxy.extend({
      optionValuePath: this.get('optionValuePath'),
      optionLabelPath: this.get('optionLabelPath'),
      value: computed('content', 'optionValuePath', function() {
        return this.get('content').get(this.get('optionValuePath'));
      }),
      label: computed('content', 'optionLabelPath', function() {
        return this.get('content').get(this.get('optionLabelPath'));
      })
    });

    return options.map((option) => {
      return objectProxy.create({
        content: option
      });
    });
  }),

  actions: {
    changeLearnerGroup(groupIdString, userId){
      this.sendPutRequests(groupIdString, userId);
    },

    addStudent(studentId) {
      this.get('toBulkSave').pushObject(studentId);
    },

    removeStudent(studentId) {
      this.get('toBulkSave').removeObject(studentId);
    },

    changeSelection(newValue) {
      newValue = newValue.get('value') === 'null' ? null : newValue.get('value');
      this.send('changeValue', newValue);
    },

    changeValue(value){
      this.setProperties({ buffer: value, valueChanged: true });
    },

    bulkSave(value) {
      this.get('toBulkSave').forEach((studentId) => {
        this.sendPutRequests(value, studentId);
      });
      this.set('toBulkSave', []);
    },

    saveAll() {
      if (this.get('someChecked') && this.get('valueChanged')) {
        let value = this.get('buffer');
        this.setProperties({ buffer: null, valueChanged: false });
        this.send('bulkSave', value);
      }
    }
  },

  notInThisGroup: t('learnerGroups.notInThisGroup'),

  membersNotInThisGroup: computed('membersNotInGroup.[]', 'topLevelGroup', function() {
    let defer = RSVP.defer();

    let userProxy = ObjectProxy.extend({
      treeGroups: [],
      overrideCurrentGroupDisplay: false,
      lowestGroupInTree: computed('content.learnerGroups.[]', 'treeGroups.[]', function() {
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

      groupDisplayValueString: computed('lowestGroupInTree.title', 'lowestGroupInTree.allParentsTitle', 'overrideCurrentGroupDisplay', function() {
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

          let proxiedUsers = this.get('membersNotInGroup').map((user) => {
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
  })
});
