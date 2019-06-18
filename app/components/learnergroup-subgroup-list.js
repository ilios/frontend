import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { Promise, all } from 'rsvp';
import { task } from 'ember-concurrency';
import pad from 'ember-pad/utils/pad';
import countDigits from '../utils/count-digits';
import cloneLearnerGroup from '../utils/clone-learner-group';

export default Component.extend({
  flashMessages: service(),
  intl: service(),
  store: service(),

  classNames: ['learnergroup-subgroup-list'],
  tagName: 'section',

  'data-test-learnergroup-subgroup-list': true,

  canCreate: false,
  canDelete: false,
  isSaving: false,
  parentGroup: null,
  saved: false,
  savedGroup: null,
  showNewLearnerGroupForm: false,

  didReceiveAttrs() {
    this._super(...arguments);
    this.setProperties({ saved: false, savedGroup: null });
  },

  actions: {
    saveNewLearnerGroup(title) {
      return new Promise(resolve => {
        const { store, parentGroup } = this;
        parentGroup.get('cohort').then((cohort) => {
          let newLearnerGroup = store.createRecord('learner-group', { title, parent: parentGroup, cohort });
          newLearnerGroup.save().then((savedLearnerGroup) => {
            this.set('showNewLearnerGroupForm', false);
            this.set('saved', true);
            this.set('savedGroup', savedLearnerGroup);
            resolve(savedLearnerGroup);
          });
        });
      });
    },

    generateNewLearnerGroups(num) {
      const { store, parentGroup } = this;
      this.set('totalGroupsToSave', num);
      this.set('currentGroupsSaved', 0);
      this.set('isSaving', true);
      return new Promise (resolve => {
        parentGroup.get('subgroupNumberingOffset').then((offset) => {
          parentGroup.get('cohort').then((cohort) => {
            let groups = [];
            const padBy = countDigits(offset + parseInt(num, 10));
            const parentTitle = parentGroup.get('title');
            const shortenedParentTitle = parentTitle.substring(0, 60 - 1 - padBy);
            for (let i = 0; i < num; i++) {
              let newGroup = store.createRecord('learner-group', {
                title: shortenedParentTitle + ' ' + pad(offset + i, padBy),
                parent: parentGroup,
                cohort
              });
              groups.pushObject(newGroup);
            }

            let saveSomeGroups = (groupsToSave) => {
              let chunk = groupsToSave.splice(0, 6);

              all(chunk.invoke('save')).then(() => {
                if (groupsToSave.length){
                  this.set('currentGroupsSaved', this.currentGroupsSaved + chunk.length);
                  saveSomeGroups(groupsToSave);
                } else {
                  this.set('isSaving', false);
                  this.set('showNewLearnerGroupForm', false);
                  this.flashMessages.success('general.savedSuccessfully');
                  resolve();
                }
              });
            };
            saveSomeGroups(groups);
          });
        });
      });
    },

    removeLearnerGroup(learnerGroup) {
      return learnerGroup.destroyRecord();
    }
  },

  copyGroup: task(function* (withLearners, learnerGroup) {
    this.set('saved', false);
    const store = this.store;
    const intl = this.intl;
    const cohort = yield learnerGroup.get('cohort');
    const parentGroup = yield learnerGroup.get('parent');
    const newGroups = yield cloneLearnerGroup(store, learnerGroup, cohort, withLearners, parentGroup);
    // indicate that the top group is a copy
    newGroups[0].set('title', newGroups[0].get('title') + ` (${intl.t('general.copy')})`);
    this.set('totalGroupsToSave', newGroups.length);
    // save groups one at a time because we need to save in this order so parents are saved before children
    for (let i = 0; i < newGroups.length; i++) {
      yield newGroups[i].save();
      this.set('currentGroupsSaved', i + 1);
    }
    this.set('saved', true);
    this.set('savedGroup', newGroups[0]);
  })
});
