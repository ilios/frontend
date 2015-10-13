import Ember from 'ember';

export default Ember.Mixin.create({
  getSessionForEvent(event){
    let promise;
    if(event.offering){
      promise = this.get('store').findRecord('offering', event.offering).then( offering => {
        return offering.get('session');
      });
    }
    if(event.ilmSession){
      promise = this.get('store').findRecord('ilmSession', event.ilmSession).then( ilmSession => {
        return ilmSession.get('session');
      });
    }
    
    return promise;
  },
  getTopicIdsForEvent(event){
    var defer = Ember.RSVP.defer();
    this.getSessionForEvent(event).then( session => {
      let promises = [];
      let seleectedTopics = [];
      promises.pushObject(session.get('topics').then( topics => {
        let topicIds = topics.mapBy('id');
        seleectedTopics.pushObjects(topicIds);
      }));
      promises.pushObject(session.get('course').then( course => {
        promises.pushObject(course.get('topics').then( topics => {
          let topicIds = topics.mapBy('id');
          seleectedTopics.pushObjects(topicIds);
        }));
      }));
      Ember.RSVP.all(promises).then(() => {
        defer.resolve(seleectedTopics.uniq());
      });
    });

    return defer.promise;
  },
  getSessionTypeIdForEvent(event){
    var defer = Ember.RSVP.defer();
    this.getSessionForEvent(event).then( session => {
      session.get('sessionType').then( sessionType => {
        defer.resolve(sessionType.get('id'));
      });
    });

    return defer.promise;
  },
  getCourseLevelForEvent(event){
    var defer = Ember.RSVP.defer();
    this.getSessionForEvent(event).then( session => {
      session.get('course').then( course => {
        defer.resolve(course.get('level'));
      });
    });

    return defer.promise;
  },
  getCourseIdForEvent(event){
    var defer = Ember.RSVP.defer();
    this.getSessionForEvent(event).then( session => {
      session.get('course').then( course => {
        defer.resolve(course.get('id'));
      });
    });

    return defer.promise;
  },
  getCohortIdsForEvent(event){
    var defer = Ember.RSVP.defer();
    this.getSessionForEvent(event).then( session => {
      session.get('course').then( course => {
        course.get('cohorts').then( cohorts => {
          defer.resolve(cohorts.mapBy('id'));
        });
      });
    });

    return defer.promise;
  }
});
