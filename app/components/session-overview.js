/* global moment */
import Ember from 'ember';


export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  store: Ember.inject.service(),
  session: null,
  editable: true,
  classNames: ['session-overview'],
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
      session.get('publishEvent').then(publishEvent => {
        session.set('publishedAsTbd', false);
        session.set('publishEvent', null);
        if(publishEvent){
          publishEvent.get('sessions').removeObject(session);
          if(publishEvent.get('totalRelated') === 0){
            publishEvent.deleteRecord();
          }
          publishEvent.save();
        }
        session.save().then(() => {
          this.get('flashMessages').success('publish.message.unPublish');
        });
      });
    },
    publishAsTbd: function(){
      var session = this.get('session');
      session.set('publishedAsTbd', true);
      session.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          publishEvent.save().then(publishEvent => {
            session.set('publishEvent', publishEvent);
            session.save().then(() => {
              this.get('flashMessages').success('publish.message.schedule');
            });
          });
        } else {
          session.save().then(() => {
            this.get('flashMessages').success('publish.message.schedule');
          });
        }
      });
    },
    publish: function(){
      var session = this.get('session');
      session.set('publishedAsTbd', false);
      session.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          publishEvent.save().then(publishEvent => {
            session.set('publishEvent', publishEvent);
            session.save().then(() => {
              this.get('flashMessages').success('publish.message.publish');
            });
          });
        } else {
          session.save().then(() => {
            this.get('flashMessages').success('publish.message.publish');
          });
        }
      });
    },
    saveIndependentLearning: function(value){
      var session = this.get('session');
      if(!value){
        session.get('ilmSessionFacet').then(function(ilmSession){
          session.set('ilmSessionFacet', null);
          ilmSession.deleteRecord();
          session.save();
          ilmSession.save();
        });
      } else {
        var ilmSession= this.get('store').createRecord('ilm-session', {
          session: session,
          hours: 1,
          dueDate: moment().add(6, 'weeks').toDate()
        });
        ilmSession.save().then(function(savedIlmSession){
          session.set('ilmSessionFacet', savedIlmSession);
          session.save();
        });
      }
    },
    changeTitle: function(value){
      this.get('session').set('title', value);
      this.get('session').save();
    },
    changeSessionType: function(newId){
      var session = this.get('session');
      var type = this.get('sessionTypes').findBy('id', newId);
      session.set('clerkshipType', type);
      type.get('sessions').then(function(sessions){
        sessions.addObject(session);
        session.save();
        sessions.save();
      });
    },
    changeSupplemental: function(value){
      this.get('session').set('supplemental', value);
      this.get('session').save();
    },
    changeSpecialEquipment: function(value){
      this.get('session').set('equipmentRequired', value);
      this.get('session').save();
    },
    changeSpecialAttire: function(value){
      this.get('session').set('attireRequired', value);
      this.get('session').save();
    },
    changeIlmHours: function(value){
      this.get('session.ilmSessionFacet').then(function(ilmSession){
        if(ilmSession){
          ilmSession.set('hours', value);
          ilmSession.save();
        }
      });
    },
    changeIlmDueDate: function(value){
      this.get('session.ilmSessionFacet').then(function(ilmSession){
        if(ilmSession){
          ilmSession.set('dueDate', value);
          ilmSession.save();
        }
      });
    },
    changeDescription: function(value){
      var self = this;
      this.get('session.sessionDescription').then(function(sessionDescription){
        if(!sessionDescription){
          sessionDescription = self.get('store').createRecord('session-description');
        }
        sessionDescription.set('description', value);
        sessionDescription.save().then(function(returnedDescription){
          self.get('session').set('sessionDescription', returnedDescription);
          self.get('session').save();
        });
      });
    },
  }
});
