import Ember from 'ember';

export default Ember.Mixin.create({
  publishTarget: null,
  publishEventCollectionName: null,
  currentUser: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  store: Ember.inject.service(),
  showCheckLink: true,
  menuTitle: Ember.computed.oneWay('publishTarget.status'),
  menuIcon: function(){
    if(this.get('publishTarget.publishedAsTbd')){
      return 'clock-o';
    }
    if(this.get('publishTarget.isPublished')){
      return 'star';
    }
    return 'cloud';
  }.property('publishTarget.isPublished', 'publishTarget.publishedAsTbd'),
  showTbd: Ember.computed.not('publishTarget.isScheduled'),
  showAsIs: function(){
    return (
      (!this.get('publishTarget.isPublished') || this.get('publishTarget.isScheduled')) &&
      this.get('publishTarget.requiredPublicationIssues.length') === 0 &&
      this.get('publishTarget.allPublicationIssuesLength') !== 0
    );
  }.property('publishTarget.isPublished','publishTarget.isScheduled', 'publishTarget.requiredPublicationIssues.length', 'publishTarget.allPublicationIssuesLength'),
  showReview: function(){
    return this.get('publishTarget.allPublicationIssuesLength') > 0 && this.get('showCheckLink');
  }.property('publishTarget.allPublicationIssuesLength', 'showCheckLink'),
  showPublish: function(){
    return (
      (!this.get('publishTarget.isPublished') || this.get('publishTarget.isScheduled')) &&
      this.get('publishTarget.allPublicationIssuesLength') === 0
    );
  }.property('publishTarget.isPublished', 'publishTarget.allPublicationIssuesLength'),
  showUnPublish: Ember.computed.or('publishTarget.isPublished', 'publishTarget.isScheduled'),
  publicationStatus: function(){
    if(this.get('publishTarget.isScheduled')){
      return 'scheduled';
    } else if (this.get('publishTarget.isPublished')){
      return 'published';
    }

    return 'notpublished';
  }.property('publishTarget.isPublished', 'publishTarget.isScheduled'),
  actions: {
    unpublish: function(){
      var publishTarget = this.get('publishTarget');
      publishTarget.get('publishEvent').then(publishEvent => {
        publishTarget.set('publishedAsTbd', false);
        publishTarget.set('publishEvent', null);
        if(publishEvent){
          publishEvent.get(this.get('publishEventCollectionName')).removeObject(publishTarget);
        }
        publishTarget.save().then(()=>{
          this.get('flashMessages').success('publish.message.unPublish');
        });
      });
    },
    publishAsTbd: function(){
      var publishTarget = this.get('publishTarget');
      publishTarget.set('publishedAsTbd', true);
      publishTarget.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          publishEvent.save().then(publishEvent => {
            publishTarget.set('publishEvent', publishEvent);
            publishTarget.save().then(() => {
              this.get('flashMessages').success('publish.message.schedule');
            });
          });
        } else {
          publishTarget.save().then(() => {
            this.get('flashMessages').success('publish.message.schedule');
          });
        }
      });
    },
    publish: function(){
      var publishTarget = this.get('publishTarget');
      publishTarget.set('publishedAsTbd', false);
      publishTarget.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          publishEvent.save().then(publishEvent => {
            publishTarget.set('publishEvent', publishEvent);
            publishTarget.save().then(() => {
              this.get('flashMessages').success('publish.message.publish');
            });
          });
        } else {
          publishTarget.save().then(() => {
            this.get('flashMessages').success('publish.message.publish');
          });
        }
      });
    },
  }
});
