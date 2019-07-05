import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
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
    async saveNewLearnerGroup(title) {
      const { parentGroup, store } = this;
      const cohort = await parentGroup.cohort;
      const newLearnerGroup = await store.createRecord('learner-group', {
        cohort, parent: parentGroup, title
      });
      const savedLearnerGroup = await newLearnerGroup.save();
      this.set('showNewLearnerGroupForm', false);
      this.setProperties({ saved: true, savedGroup: savedLearnerGroup });
    },

    async generateNewLearnerGroups(num) {
      const { parentGroup, store } = this;
      this.set('currentGroupsSaved', 0);
      this.setProperties({ isSaving: true, totalGroupsToSave: num });
      const offset = await parentGroup.subgroupNumberingOffset;
      const cohort = await parentGroup.cohort;
      const groups = [];
      const padBy = countDigits(offset + parseInt(num, 10));
      const parentTitle = parentGroup.title.substring(0, 60 - 1 - padBy);

      for (let i = 0; i < num; i++) {
        const newGroup = await store.createRecord('learner-group', {
          cohort,
          parent: parentGroup,
          title: `${parentTitle} ${pad(offset + i, padBy)}`
        });
        groups.pushObject(newGroup);
      }

      const saveSomeGroups = async (groupsToSave) => {
        const chunk = groupsToSave.splice(0, 6);
        await all(chunk.invoke('save'));

        if (groupsToSave.length){
          this.set('currentGroupsSaved', this.currentGroupsSaved + chunk.length);
          await saveSomeGroups(groupsToSave);
        } else {
          this.set('isSaving', false);
          this.set('showNewLearnerGroupForm', false);
          this.flashMessages.success('general.savedSuccessfully');
        }
      };

      await saveSomeGroups(groups);
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
