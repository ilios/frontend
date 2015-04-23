import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  store: Ember.inject.service(),
  program: null,
  showCheckLink: true,
  menuTitle: Ember.computed.oneWay('program.status'),
  menuIcon: function(){
    if(this.get('program.publishedAsTbd')){
      return 'clock-o';
    }
    if(this.get('program.isPublished')){
      return 'star';
    }
    return 'cloud';
  }.property('program.isPublished', 'program.publishedAsTbd'),
  showTbd: Ember.computed.not('program.isScheduled'),
  showAsIs: function(){
    return (
      (!this.get('program.isPublished') || this.get('program.isScheduled')) &&
      this.get('program.requiredPublicationIssues.length') === 0 &&
      this.get('program.allPublicationIssuesLength') !== 0
    );
  }.property('program.isPublished','program.isScheduled', 'program.requiredPublicationIssues.length', 'program.allPublicationIssuesLength'),
  showReview: function(){
    return this.get('program.allPublicationIssuesLength') > 0 &&
    this.get('showCheckLink');
  }.property('program.allPublicationIssuesLength', 'showCheckLink'),
  showPublish: function(){
    return (
      (!this.get('program.isPublished') || this.get('program.isScheduled')) &&
      this.get('program.allPublicationIssuesLength') === 0
    );
  }.property('program.isPublished', 'program.allPublicationIssuesLength'),
  showUnPublish: Ember.computed.or('program.isPublished', 'program.isScheduled'),
  publicationStatus: function(){
    if(this.get('program.isScheduled')){
      return 'scheduled';
    } else if (this.get('program.isPublished')){
      return 'published';
    }

    return 'notpublished';
  }.property('program.isPublished', 'program.isScheduled'),
  actions: {
    unpublish: function(){
      var program = this.get('program');
      program.get('publishEvent').then(function(publishEvent){
        program.set('publishedAsTbd', false);
        program.set('publishEvent', null);
        program.save();
        if(publishEvent){
          publishEvent.get('programs').removeObject(program);
          if(publishEvent.get('totalRelated') === 0){
            publishEvent.deleteRecord();
          }
          publishEvent.save();
        }
      });
    },
    publishAsTbd: function(){
      var self = this;
      var program = this.get('program');
      program.set('publishedAsTbd', true);
      program.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.get('store').createRecord('publish-event', {
            administrator: self.get('currentUser.model')
          });
          publishEvent.save().then(function(publishEvent){
            program.set('publishEvent', publishEvent);
            program.save();
          });
        } else {
          program.save();
        }
      });
    },
    publish: function(){
      var program = this.get('program');
      var self = this;
      program.set('publishedAsTbd', false);
      program.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.get('store').createRecord('publish-event', {
              administrator: self.get('currentUser.model')
          });
          publishEvent.save().then(function(publishEvent){
            program.set('publishEvent', publishEvent);
            program.save();
          });
        } else {
          program.save();
        }
      });
    },
    changeTitle: function(newTitle){
      this.get('program').set('title', newTitle);
      this.get('program').save();
    },
  }
});
