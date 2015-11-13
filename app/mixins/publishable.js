import Ember from 'ember';

const { RSVP, inject, computed } = Ember;
const { service } = inject;

export default Ember.Mixin.create({
  publishTarget: null,
  publishEventCollectionName: null,
  currentUser: service(),
  flashMessages: service(),
  store: service(),
  showCheckLink: true,
  menuTitle: computed.oneWay('publishTarget.status'),
  menuIcon: function(){
    if(this.get('publishTarget.publishedAsTbd')){
      return 'clock-o';
    }
    if(this.get('publishTarget.isPublished')){
      return 'star';
    }
    return 'cloud';
  }.property('publishTarget.isPublished', 'publishTarget.publishedAsTbd'),
  showTbd: computed.not('publishTarget.isScheduled'),
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
  showUnPublish: computed.or('publishTarget.isPublished', 'publishTarget.isScheduled'),
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
      let publishTarget = this.get('publishTarget');
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
      let publishTarget = this.get('publishTarget');
      let promises = [];
      if(!publishTarget.get('publishedAsTbd')){
        publishTarget.set('publishedAsTbd', true);
        promises.pushObject(publishTarget.save());
      }
      promises.pushObject(publishTarget.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          publishEvent.get(this.get('publishEventCollectionName')).removeObject(publishTarget);
          publishTarget.set('publishEvent', publishEvent);
          return publishTarget.save();
        }
      }));
      
      RSVP.all(promises).then(()=>{
        this.get('flashMessages').success('publish.message.scheduled');
      });
    },
    publish: function(){
      let publishTarget = this.get('publishTarget');
      let promises = [];
      if(publishTarget.get('publishedAsTbd')){
        publishTarget.set('publishedAsTbd', false);
        promises.pushObject(publishTarget.save());
      }
      promises.pushObject(publishTarget.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          publishEvent.get(this.get('publishEventCollectionName')).removeObject(publishTarget);
          publishTarget.set('publishEvent', publishEvent);
          return publishTarget.save();
        }
      }));
      
      RSVP.all(promises).then(()=>{
        this.get('flashMessages').success('publish.message.publish');
      });
    },
  }
});
