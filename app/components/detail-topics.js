import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['detail-topics'],
  subject: null,
  isManaging: false,
  //keep track of our initial state so we can roll back
  initialTopics: [],
  actions: {
    manage: function(){
      var self = this;
      this.get('subject.topics').then(function(topics){
        self.set('initialTopics', topics.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
      this.set('isManaging', false);
      this.get('subject').save();
    },
    cancel: function(){
      var topics = this.get('subject').get('topics');
      topics.clear();
      topics.addObjects(this.get('initialTopics'));
      this.set('isManaging', false);
    }
  }
});
