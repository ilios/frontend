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
