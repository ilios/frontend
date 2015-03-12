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
    }
  }

});
