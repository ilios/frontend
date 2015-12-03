import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['detail-learnergroups'],
  subject: null,
  isIlmSession: false,
  isManaging: false,
  initialGroups: [],
  cohorts: [],
  actions: {
    manage: function(){
      var self = this;
      this.get('subject.learnerGroups').then(function(learnerGroups){
        self.set('initialGroups', learnerGroups.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
      var self = this;
      //we get a proxy here so we use the content
      let subject = this.get('subject.content');
      subject.get('learnerGroups').then(function(newLearnerGroups){
        let oldLearnerGroups = self.get('initialGroups').filter(function(learnerGroup){
          return !newLearnerGroups.contains(learnerGroup);
        });
        oldLearnerGroups.forEach(function(learnerGroup){
          if(self.get('isIlmSession')){
            learnerGroup.get('ilmSessions').removeObject(subject);
          }
          learnerGroup.save();
        });

        subject.save().then(function(){
          newLearnerGroups.save().then(function(){
            self.set('isManaging', false);
            self.set('initialGroups', []);
          });
        });
      });
    },
    cancel: function(){
      var learnerGroups = this.get('subject').get('learnerGroups');
      learnerGroups.clear();
      learnerGroups.addObjects(this.get('initialGroups'));
      this.set('isManaging', false);
    }
  }
});
