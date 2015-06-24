import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  parentGroup: null,
  classNames: ['learnergroup-subgroup-list'],
  learnerGroups: Ember.computed.oneWay('parentGroup.children'),
  sortBy: ['title'],
  sortedLearnerGroups: Ember.computed.sort('learnerGroups', 'sortBy'),
  proxiedLearnerGroups: function(){
    return this.get('sortedLearnerGroups').map(function(learnerGroup){
      return Ember.ObjectProxy.create({
        content: learnerGroup,
        showRemoveConfirmation: false
      });
    });
  }.property('sortedLearnerGroups.@each'),
  newLearnerGroups: [],
  actions: {
    editLearnerGroup: function(learnerGroupProxy){
      let learnerGroup = learnerGroupProxy.get('content');
      this.transitionToRoute('learnergroup', learnerGroup);
    },
    cancelRemove: function(learnerGroupProxy){
      learnerGroupProxy.set('showRemoveConfirmation', false);
    },
    confirmRemove: function(learnerGroupProxy){
      learnerGroupProxy.set('showRemoveConfirmation', true);
    },
    removeLearnerGroup: function(learnerGroupProxy){
      let learnerGroup = learnerGroupProxy.get('content');
      this.get('parentGroup.children').removeObject(learnerGroup);
      learnerGroup.deleteRecord();
      learnerGroup.save();
    },
    addLearnerGroup: function(){
      var learnerGroup = this.get('store').createRecord('learnerGroup', {
        title: null,
      });
      this.get('newLearnerGroups').addObject(learnerGroup);
    },
    saveNewLearnerGroup: function(newLearnerGroup){
      this.get('parentGroup.cohort').then(cohort=> {
        this.get('newLearnerGroups').removeObject(newLearnerGroup);

        newLearnerGroup.set('parent', this.get('parentGroup'));
        newLearnerGroup.set('cohort', cohort);
        newLearnerGroup.save().then(
          savedLearnerGroup => {
            this.get('parentGroup').get('children').addObject(savedLearnerGroup);
            cohort.get('learnerGroups').addObject(savedLearnerGroup);
          }
        );
      });
    },
    removeNewLearnerGroup: function(newLearnerGroup){
      this.get('newLearnerGroups').removeObject(newLearnerGroup);
    },
  },
});
