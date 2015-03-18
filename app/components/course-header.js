import Ember from 'ember';

export default Ember.Component.extend({
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
      course.get('publishEvent').then(function(publishEvent){
        course.set('publishedAsTbd', false);
        course.set('publishEvent', null);
        course.save();
        if(publishEvent){
          publishEvent.get('courses').removeObject(course);
          if(publishEvent.get('totalRelated') === 0){
            publishEvent.deleteRecord();
          }
          publishEvent.save();
        }
      });
    },
    publishAsTbd: function(){
      var self = this;
      var course = this.get('course');
      course.set('publishedAsTbd', true);
      course.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.store.createRecord('publish-event', {
            administrator: self.get('currentUser')
          });
          publishEvent.save().then(function(publishEvent){
            course.set('publishEvent', publishEvent);
            course.save();
          });
        } else {
          course.save();
        }
      });
    },
    publish: function(){
      var course = this.get('course');
      var self = this;
      course.set('publishedAsTbd', false);
      course.get('publishEvent').then(function(publishEvent){
        if(!publishEvent){
          publishEvent = self.store.createRecord('publish-event', {
            administrator: self.get('currentUser')
          });
          publishEvent.save().then(function(publishEvent){
            course.set('publishEvent', publishEvent);
            course.save();
          });
        } else {
          course.save();
        }
      });
    },
  }
});
