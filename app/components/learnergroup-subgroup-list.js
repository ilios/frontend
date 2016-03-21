import Ember from 'ember';
import pad from 'ember-pad/utils/pad';
import countDigits from '../utils/count-digits';

const { Component, computed, inject, ObjectProxy } = Ember;
const { service } = inject;
const { oneWay, sort } = computed;

export default Component.extend({
  store: service(),
  isSaving: false,
  totalGroupsToSave: null,
  currentGroupsSaved: null,
  classNames: ['learnergroup-subgroup-list'],
  parentGroup: null,
  learnerGroups: oneWay('parentGroup.children'),
  sortBy: ['title'],
  sortedLearnerGroups: sort('learnerGroups', 'sortBy'),

  proxiedLearnerGroups: computed('sortedLearnerGroups.[]', {
    get() {
      const sortedLearnerGroups = this.get('sortedLearnerGroups');

      return sortedLearnerGroups.map((learnerGroup) => {
        return ObjectProxy.create({
          content: learnerGroup,
          showRemoveConfirmation: false
        });
      });
    }
  }).readOnly(),

  showNewLearnerGroupForm: false,

  actions: {
    editLearnerGroup(learnerGroupProxy) {
      const learnerGroup = learnerGroupProxy.get('content');
      this.transitionToRoute('learnergroup', learnerGroup);
    },

    cancelRemove(learnerGroupProxy) {
      learnerGroupProxy.set('showRemoveConfirmation', false);
    },

    confirmRemove(learnerGroupProxy) {
      learnerGroupProxy.set('showRemoveConfirmation', true);
    },

    removeLearnerGroup(learnerGroupProxy) {
      const learnerGroup = learnerGroupProxy.get('content');
      this.get('parentGroup.children').removeObject(learnerGroup);
      learnerGroup.destroyRecord();
    },

    toggleNewLearnerGroupForm() {
      this.set('showNewLearnerGroupForm', !this.get('showNewLearnerGroupForm'));
    },

    saveNewLearnerGroup(title) {
      const { store, parentGroup } = this.getProperties('store', 'parentGroup');

      parentGroup.get('cohort').then((cohort) => {
        const newLearnerGroup = store.createRecord('learner-group', { title, parent: parentGroup, cohort });

        newLearnerGroup.save().then((savedLearnerGroup) => {
          parentGroup.get('children').addObject(savedLearnerGroup);
          cohort.get('learnerGroups').addObject(savedLearnerGroup);
          this.send('cancel');
        });
      });
    },

    generateNewLearnerGroups(num) {
      const { store, parentGroup } = this.getProperties('store', 'parentGroup');

      this.set('totalGroupsToSave', num);
      this.set('currentGroupsSaved', 0);
      this.set('isSaving', true);

      parentGroup.get('subgroupNumberingOffset').then((offset) => {
        parentGroup.get('cohort').then((cohort) => {
          let groups = [];
          const padBy = countDigits(num + offset - 1) - 1;
          for (let i = 0; i < num; i++) {
            let newGroup = store.createRecord('learner-group', {
              title: parentGroup.get('title') + ' ' + pad(offset + i, padBy),
              parent: parentGroup,
              cohort
            });
            groups.pushObject(newGroup);
          }

          let saveSomeGroups = (groups) => {
            let chunk = groups.splice(0, 6);

            Ember.RSVP.all(chunk.invoke('save')).then(() => {
              if (groups.length){
                this.set('currentGroupsSaved', this.get('currentGroupsSaved') + chunk.length);
                saveSomeGroups(groups);
              } else {
                this.set('isSaving', false);
                this.send('cancel');
                this.get('flashMessages').success('general.savedSuccessfully');
              }
            });
          };
          saveSomeGroups(groups);
        });
      });
    },

    cancel() {
      this.set('showNewLearnerGroupForm', false);
    }
  }
});
