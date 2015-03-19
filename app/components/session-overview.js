import Ember from 'ember';

export default Ember.Component.extend({
  session: null,
  editable: true,
  sortTypes: ['title'],
  sessionTypes: [],
  sortedSessionTypes: Ember.computed.sort('sessionTypes', 'sortTypes'),
  showCheckLink: true,
  menuTitle: Ember.computed.oneWay('session.status'),
  menuIcon: function(){
    if(this.get('session.publishedAsTbd')){
      return 'clock-o';
    }
    if(this.get('session.isPublished')){
      return 'star';
    }
    return 'cloud';
  }.property('session.isPublished', 'session.publishedAsTbd'),
  showTbd: Ember.computed.not('session.isScheduled'),
  showAsIs: function(){
    return (
      (!this.get('session.isPublished') || this.get('session.isScheduled')) &&
      this.get('session.requiredPublicationIssues.length') === 0 &&
      this.get('session.allPublicationIssuesLength') !== 0
    );
  }.property('session.isPublished', 'session.requiredPublicationIssues.length', 'session.allPublicationIssuesLength'),
  showReview: function(){
    return this.get('session.allPublicationIssuesLength') > 0 &&
    this.get('showCheckLink');
  }.property('session.allPublicationIssuesLength', 'showCheckLink'),
  showPublish: function(){
    return (
      (!this.get('session.isPublished') || this.get('session.isScheduled')) &&
      this.get('session.allPublicationIssuesLength') === 0
    );
  }.property('session.isPublished', 'session.allPublicationIssuesLength'),
  showUnPublish: Ember.computed.or('session.isPublished', 'session.isScheduled'),
  publicationStatus: function(){
    if(this.get('session.isScheduled')){
      return 'scheduled';
    } else if (this.get('session.isPublished')){
      return 'published';
    }

    return 'notpublished';
  }.property('session.isPublished', 'session.isScheduled'),
  actions: {
    unpublish: function(){
      var session = this.get('session');
      session.get('publishEvent').then(function(publishEvent){
        session.set('publishedAsTbd', false);
        session.set('publishEvent', null);
        if(publishEvent){
          publishEvent.get('sessions').removeObject(session);
          if(publishEvent.get('totalRelated') === 0){
            publishEvent.deleteRecord();
          }
          publishEvent.save();
        }
        session.save();
      });
    },
    publishAsTbd: function(){
      var self = this;
      var session = this.get('session');
      session.set('publishedAsTbd', true);
      session.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.store.createRecord('publish-event', {
            administrator: self.get('currentUser.content')
          });
          publishEvent.save().then(function(publishEvent){
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
            administrator: self.get('currentUser.content')
          });
          publishEvent.save().then(function(publishEvent){
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
