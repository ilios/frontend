import Ember from 'ember';

const { Component, computed, inject, ObjectProxy } = Ember;
const { service } = inject;
const { oneWay, sort } = computed;

export default Component.extend({
  store: service(),

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

    cancel() {
      this.set('showNewLearnerGroupForm', false);
    }
  }
});
