import Ember from 'ember';

export default Ember.Component.extend({
  session: null,
  editable: true,
  sortTypes: ['title'],
  sessionTypes: [],
  sortedSessionTypes: Ember.computed.sort('sessionTypes', 'sortTypes'),
  showCheckLink: true,
  actions: {
    unpublish: function(){
      var session = this.get('session');
      session.get('publishEvent').then(function(publishEvent){
        session.set('publishedAsTbd', false);
        session.set('publishEvent', null);
        session.save();
        if(publishEvent){
          publishEvent.get('sessions').removeObject(session);
          if(publishEvent.get('totalRelated') === 0){
            publishEvent.deleteRecord();
          }
          publishEvent.save();
        }
      });
    },
    publishAsTbd: function(){
      var self = this;
      var session = this.get('session');
      session.set('publishedAsTbd', true);
      session.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.store.createRecord('publish-event', {
            administrator: self.get('currentUser')
          });
          publishEvent.save().then(function(){
            session.set('publishEvent', publishEvent);
            session.save();
          });
        } else {
          session.save();
        }
      });
    },
    publish: function(){
      var session = this.get('session');
      var self = this;
      session.set('publishedAsTbd', false);
      session.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.store.createRecord('publish-event', {
            administrator: self.get('currentUser')
          });
          publishEvent.save().then(function(){
            session.set('publishEvent', publishEvent);
            session.save();
          });
        } else {
          session.save();
        }
      });
    }
  }
});
