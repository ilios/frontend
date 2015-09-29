import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";
import MembersMixin from 'ilios/mixins/members';

const { Component, computed, ObjectProxy, RSVP } = Ember;
const { empty, not } = computed;
const { all, Promise } = RSVP;
const { PromiseArray, PromiseObject } = DS;

export default Component.extend(MembersMixin, {
  classNames: ['learnergroup-members-multiedit', 'form-container'],
  tagName: 'section',

  noneChecked: empty('toBulkSave'),
  someChecked: not('noneChecked'),

  buffer: null,
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
  }),

  actions: {
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
      this.set('buffer', value);
    },

    bulkSave(value) {
      this.get('toBulkSave').forEach((studentId) => {
        this.sendPutRequests(value, studentId);
      });
      this.set('toBulkSave', []);
    },

    saveAll() {
      let value = this.get('buffer');

      if (this.get('someChecked') && value) {
        this.send('bulkSave', value);
      }
    }
  }
});
