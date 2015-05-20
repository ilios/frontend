import Ember from 'ember';

export default Ember.Component.extend({
  currentUser: Ember.inject.service(),
  flashMessages: Ember.inject.service(),
  store: Ember.inject.service(),
  course: null,
  editable: true,
  showCheckLink: true,
  menuTitle: Ember.computed.oneWay('course.status'),
  menuIcon: function(){
    if(this.get('course.publishedAsTbd')){
      return 'clock-o';
    }
    if(this.get('course.isPublished')){
      return 'star';
    }
    return 'cloud';
  }.property('course.isPublished', 'course.publishedAsTbd'),
  showTbd: Ember.computed.not('course.isScheduled'),
  showAsIs: function(){
    return (
      (!this.get('course.isPublished') || this.get('course.isScheduled')) &&
      this.get('course.requiredPublicationIssues.length') === 0 &&
      this.get('course.allPublicationIssuesLength') !== 0
    );
  }.property('course.isPublished', 'course.requiredPublicationIssues.length', 'course.allPublicationIssuesLength'),
  showReview: function(){
    return this.get('course.allPublicationIssuesLength') > 0 &&
    this.get('showCheckLink');
  }.property('course.allPublicationIssuesLength', 'showCheckLink'),
  showPublish: function(){
    return (
      (!this.get('course.isPublished') || this.get('course.isScheduled')) &&
      this.get('course.allPublicationIssuesLength') === 0
    );
  }.property('course.isPublished', 'course.allPublicationIssuesLength'),
  showUnPublish: Ember.computed.or('course.isPublished', 'course.isScheduled'),
  publicationStatus: function(){
    if(this.get('course.isScheduled')){
      return 'scheduled';
    } else if (this.get('course.isPublished')){
      return 'published';
    }

    return 'notpublished';
  }.property('course.isPublished', 'course.isScheduled'),
  actions: {
    unpublish: function(){
      var course = this.get('course');
      course.get('publishEvent').then(publishEvent => {
        course.set('publishedAsTbd', false);
        course.set('publishEvent', null);
        course.save();
        if(publishEvent){
          publishEvent.get('courses').removeObject(course);
          if(publishEvent.get('totalRelated') === 0){
            publishEvent.deleteRecord();
          }
          publishEvent.save().then(() => {
            course.save().then(()=>{
              this.get('flashMessages').success('publish.message.unPublish');
            });
          });
        } else {
          course.save().then(()=>{
            this.get('flashMessages').success('publish.message.unPublish');
          });
        }
      });
    },
    publishAsTbd: function(){
      var course = this.get('course');
      course.set('publishedAsTbd', true);
      course.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
            administrator: this.get('currentUser.model')
          });
          publishEvent.save().then(publishEvent => {
            course.set('publishEvent', publishEvent);
            course.save().then(()=>{
              this.get('flashMessages').success('publish.message.schedule');
            });
          });
        } else {
          course.save().then(()=>{
            this.get('flashMessages').success('publish.message.schedule');
          });
        }
      });
    },
    publish: function(){
      var course = this.get('course');
      course.set('publishedAsTbd', false);
      course.get('publishEvent').then(publishEvent => {
        if(!publishEvent){
          publishEvent = this.get('store').createRecord('publish-event', {
              administrator: this.get('currentUser.model')
          });
          publishEvent.save().then(publishEvent => {
            course.set('publishEvent', publishEvent);
            course.save().then(()=>{
              this.get('flashMessages').success('publish.message.publish');
            });
          });
        } else {
          course.save().then(()=>{
            this.get('flashMessages').success('publish.message.publish');
          });
        }
      });
    },
    changeTitle: function(newTitle){
      this.get('course').set('title', newTitle);
      this.get('course').save();
    },
  }
});
