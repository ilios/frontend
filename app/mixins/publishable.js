import Ember from 'ember';

const { inject, computed } = Ember;
const { service } = inject;
const { not, oneWay, or } = computed;

export default Ember.Mixin.create({
  publishTarget: null,
  publishEventCollectionName: null,
  currentUser: service(),
  flashMessages: service(),
  store: service(),
  showCheckLink: true,
  menuTitle: oneWay('publishTarget.status'),
  menuIcon: computed('publishTarget.isPublished', 'publishTarget.publishedAsTbd', function(){
    if(this.get('publishTarget.publishedAsTbd')){
      return 'clock-o';
    }
    if(this.get('publishTarget.isPublished')){
      return 'star';
    }
    return 'cloud';
  }),
  showTbd: not('publishTarget.isScheduled'),
  showAsIs: computed(
    'publishTarget.isPublished',
    'publishTarget.isScheduled',
    'publishTarget.requiredPublicationIssues.length',
    'publishTarget.allPublicationIssuesLength',
    function(){
      return (
        (!this.get('publishTarget.isPublished') || this.get('publishTarget.isScheduled')) &&
        this.get('publishTarget.requiredPublicationIssues.length') === 0 &&
        this.get('publishTarget.allPublicationIssuesLength') !== 0
      );
    }
  ),
  showReview: computed('publishTarget.allPublicationIssuesLength', 'showCheckLink', function(){
    return this.get('publishTarget.allPublicationIssuesLength') > 0 && this.get('showCheckLink');
  }),
  showPublish: computed(
    'publishTarget.isPublished',
    'publishTarget.allPublicationIssuesLength',
    function(){
      return (
        (!this.get('publishTarget.isPublished') || this.get('publishTarget.isScheduled')) &&
        this.get('publishTarget.allPublicationIssuesLength') === 0
      );
    }
  ),
  showUnPublish: or('publishTarget.isPublished', 'publishTarget.isScheduled'),
  publicationStatus: computed('publishTarget.isPublished', 'publishTarget.isScheduled', function(){
    if(this.get('publishTarget.isScheduled')){
      return 'scheduled';
    } else if (this.get('publishTarget.isPublished')){
      return 'published';
    }

    return 'notpublished';
  }),
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
      publishTarget.set('publishedAsTbd', true);
      publishTarget.get('publishEvent').then(publishEvent => {
        let promise;
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          promise = publishEvent.save().then(newEvent => {
            newEvent.get(this.get('publishEventCollectionName')).addObject(publishTarget);
            publishTarget.set('publishEvent', newEvent);
            
            return publishTarget.save();
          });
        } else {
          promise = publishTarget.save();
        }

        promise.then(()=>{
          this.get('flashMessages').success('publish.message.schedule');
        });
      });
    },
    publish: function(){
      let publishTarget = this.get('publishTarget');
      publishTarget.set('publishedAsTbd', false);
      publishTarget.get('publishEvent').then(publishEvent => {
        let promise;
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          promise = publishEvent.save().then(newEvent => {
            newEvent.get(this.get('publishEventCollectionName')).addObject(publishTarget);
            publishTarget.set('publishEvent', newEvent);
            
            return publishTarget.save();
          });
        } else {
          promise = publishTarget.save();
        }

        promise.then(()=>{
          this.get('flashMessages').success('publish.message.publish');
        });
      });
    },
  }
});
