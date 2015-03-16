import Ember from 'ember';

export default Ember.Component.extend({
  subject: null,
  isManaging: false,
  //keep track of our initial state so we can roll back
  initialTopics: [],
  actions: {
    manage: function(){
      var self = this;
      this.get('subject.disciplines').then(function(topics){
        self.set('initialTopics', topics.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
      this.set('isManaging', false);
      this.get('subject').save();
    },
    cancel: function(){
      var topics = this.get('subject').get('disciplines');
      topics.clear();
      topics.addObjects(this.get('initialTopics'));
      this.set('isManaging', false);
    }
  }
});
