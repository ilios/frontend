import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  store: Ember.inject.service(),
  programYear: null,
  showCheckLink: true,
  menuTitle: Ember.computed.oneWay('programYear.status'),
  menuIcon: function(){
    if(this.get('programYear.publishedAsTbd')){
      return 'clock-o';
    }
    if(this.get('programYear.isPublished')){
      return 'star';
    }
    return 'cloud';
  }.property('programYear.isPublished', 'programYear.publishedAsTbd'),
  showTbd: Ember.computed.not('programYear.isScheduled'),
  showAsIs: function(){
    return (
      (!this.get('programYear.isPublished') || this.get('programYear.isScheduled')) &&
      this.get('programYear.requiredPublicationIssues.length') === 0 &&
      this.get('programYear.allPublicationIssuesLength') !== 0
    );
  }.property('programYear.isPublished','programYear.isScheduled', 'programYear.requiredPublicationIssues.length', 'programYear.allPublicationIssuesLength'),
  showReview: function(){
    return this.get('programYear.allPublicationIssuesLength') > 0 &&
    this.get('showCheckLink');
  }.property('programYear.allPublicationIssuesLength', 'showCheckLink'),
  showPublish: function(){
    return (
      (!this.get('programYear.isPublished') || this.get('programYear.isScheduled')) &&
      this.get('programYear.allPublicationIssuesLength') === 0
    );
  }.property('programYear.isPublished', 'programYear.allPublicationIssuesLength'),
  showUnPublish: Ember.computed.or('programYear.isPublished', 'programYear.isScheduled'),
  publicationStatus: function(){
    if(this.get('programYear.isScheduled')){
      return 'scheduled';
    } else if (this.get('programYear.isPublished')){
      return 'published';
    }

    return 'notpublished';
  }.property('programYear.isPublished', 'programYear.isScheduled'),
  actions: {
    unpublish: function(){
      var programYear = this.get('programYear');
      programYear.get('publishEvent').then(function(publishEvent){
        programYear.set('publishedAsTbd', false);
        programYear.set('publishEvent', null);
        programYear.save();
        if(publishEvent){
          publishEvent.get('programYears').removeObject(programYear);
          if(publishEvent.get('totalRelated') === 0){
            publishEvent.deleteRecord();
          }
          publishEvent.save();
        }
      });
    },
    publishAsTbd: function(){
      var self = this;
      var programYear = this.get('programYear');
      programYear.set('publishedAsTbd', true);
      programYear.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.get('store').createRecord('publish-event', {
            administrator: self.get('currentUser.model')
          });
          publishEvent.save().then(function(publishEvent){
            programYear.set('publishEvent', publishEvent);
            programYear.save();
          });
        } else {
          programYear.save();
        }
      });
    },
    publish: function(){
      var programYear = this.get('programYear');
      var self = this;
      programYear.set('publishedAsTbd', false);
      programYear.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.get('store').createRecord('publish-event', {
              administrator: self.get('currentUser.model')
          });
          publishEvent.save().then(function(publishEvent){
            programYear.set('publishEvent', publishEvent);
            programYear.save();
          });
        } else {
          programYear.save();
        }
      });
    }
  }
});
