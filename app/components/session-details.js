import Ember from 'ember';

export default Ember.Component.extend({
  availableTopics: [],
  sessionTypes: [],
  session: null,
  actions: {
    save: function(){
      var self = this;
      var  session = this.get('session');
      session.save().then(function(session){
        if(!self.get('isDestroyed')){
          self.set('session', session);
        }
      });
    },
    addTopic: function(topic){
      var session = this.get('session');
      session.get('disciplines').then(function(topics){
        topic.get('sessions').then(function(sessions){
          sessions.addObject(session);
          topics.addObject(topic);
          session.save();
          topic.save();
        });
      });
    },
    removeTopic: function(topic){
      var session = this.get('session');
      session.get('disciplines').then(function(topics){
        topic.get('sessions').then(function(sessions){
          sessions.removeObject(session);
          topics.removeObject(topic);
          session.save();
          topic.save();
        });
      });
    },
    addMeshDescriptor: function(descriptor){
      var session = this.get('session');
      session.get('meshDescriptors').then(function(descriptors){
        descriptor.get('sessions').then(function(sessions){
          sessions.addObject(session);
          descriptors.addObject(descriptor);
          session.save();
          descriptor.save();
        });
      });
    },
    removeMeshDescriptor: function(descriptor){
      var session = this.get('session');
      session.get('meshDescriptors').then(function(descriptors){
        descriptor.get('sessions').then(function(sessions){
          sessions.removeObject(session);
          descriptors.removeObject(descriptor);
          session.save();
          descriptor.save();
        });
      });
    }
  }

});
