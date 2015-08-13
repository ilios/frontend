/* global moment */
import Ember from 'ember';
import DS from 'ember-data';
import { moment as momentHelper } from 'ember-moment/computed';

export default Ember.Component.extend({
  userEvents: Ember.inject.service(),
  schoolEvents: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  date: null,
  showFilters: false,
  selectedDate: null,
  selectedView: null,
  mySchedule: true,
  courseFilters: false,
  setup: Ember.on('init', function() {
    //do these on setup otherwise tests were failing because
    //the old filter value hung around
    this.set('selectedTopics', []);
    this.set('selectedSessionTypes', []);
    this.set('selectedCourseLevels', []);
    this.set('selectedCohorts', []);
    this.set('selectedCourses', []);
  }),
  fromTimeStamp: Ember.computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).startOf(this.get('selectedView')).unix();
  }),
  toTimeStamp: Ember.computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).endOf(this.get('selectedView')).unix();
  }),
  calendarDate: momentHelper('selectedDate', 'YYYY-MM-DD'),
  events: Ember.computed('mySchedule', 'fromTimeStamp', 'toTimeStamp', 'selectedSchool', 'selectedView', function(){
    if(this.get('mySchedule')) {
      return DS.PromiseArray.create({
        promise: this.get('userEvents').getEvents(this.get('fromTimeStamp'), this.get('toTimeStamp'))
      });
    }
    if(!this.get('mySchedule')) {
      let deferred = Ember.RSVP.defer();
      this.get('selectedSchool').then(school => {
        this.get('schoolEvents').getEvents(school.get('id'), this.get('fromTimeStamp'), this.get('toTimeStamp')).then(events => {
          if(this.get('selectedView') === 'day'){
            deferred.resolve(events);
          } else {
            let sessionEvents = {};
            let promises = [];
            events.forEach(event => {
              promises.pushObject(this.get('schoolEvents').getSessionForEvent(event).then(session => {
                let sid = session.get('id');
                if(!(sid in sessionEvents)){
                  sessionEvents[sid] = [];
                }
                sessionEvents[sid].pushObject(event);
              }));
            });
            Ember.RSVP.all(promises).then(() => {
              let singleEventPerSession = [];
              for(let id in sessionEvents){
                singleEventPerSession.pushObject(sessionEvents[id].get('firstObject'));
              }
              deferred.resolve(singleEventPerSession);
            });
            
          }
        });
      });
      return DS.PromiseArray.create({
        promise: deferred.promise
      });
    }
  }),
  filteredEvents: Ember.computed(
    'events.[]',
    'eventsWithSelectedTopics.[]',
    'eventsWithSelectedSessionTypes.[]',
    'eventsWithSelectedCourseLevels.[]',
    'eventsWithSelectedCohorts.[]',
    'eventsWithSelectedCourses.[]',
    function() {
      let defer = Ember.RSVP.defer();
      let promises = [];
      let eventTypes = [
        'eventsWithSelectedTopics',
        'eventsWithSelectedSessionTypes',
        'eventsWithSelectedCourseLevels',
        'eventsWithSelectedCohorts',
        'eventsWithSelectedCourses',
      ];
      let allFilteredEvents = [];
      eventTypes.forEach(name => {
        promises.pushObject(this.get(name).then(events => {
          allFilteredEvents.pushObject(events);
        }));
      });
      
      Ember.RSVP.all(promises).then(()=> {
        let events = this.get('events').filter(event => {
          return allFilteredEvents.every(arr => {
            let bool = arr.contains(event);
            
            return bool;
          });
        });
        
        defer.resolve(events);
      });
      return DS.PromiseArray.create({
        promise: defer.promise
      });
      
  }),
  eventsWithSelectedTopics: Ember.computed('events.[]', 'selectedTopics.[]', function(){
    let selectedTopics = this.get('selectedTopics');
    if(selectedTopics.length === 0) {
      return this.get('events');
    }
    selectedTopics = selectedTopics.mapBy('id');
    let matchingEvents = [];
    let defer = Ember.RSVP.defer();
    let promises = [];
    this.get('events').forEach(event => {
      promises.pushObject(this.get('userEvents').getTopicIdsForEvent(event).then( topics => {
        if (topics.any( topicId => {
          return selectedTopics.contains(topicId);
        })) {
          matchingEvents.pushObject(event);
        }
      }));
    });
    
    Ember.RSVP.all(promises).then(()=> {
      defer.resolve(matchingEvents);
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  eventsWithSelectedSessionTypes: Ember.computed('events.[]', 'selectedSessionTypes.[]', function(){
    let selectedSessionTypes = this.get('selectedSessionTypes').mapBy('id');
    let events = this.get('events');
    if(selectedSessionTypes.length === 0) {
      return events;
    }
    let matchingEvents = [];
    let defer = Ember.RSVP.defer();
    let promises = [];
    events.forEach(event => {
      promises.pushObject(this.get('userEvents').getSessionTypeIdForEvent(event).then( id => {
        if (selectedSessionTypes.contains(id)) {
          matchingEvents.pushObject(event);
        }
      }));
    });
    
    Ember.RSVP.all(promises).then(()=> {
      defer.resolve(matchingEvents);
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  eventsWithSelectedCourseLevels: Ember.computed('events.[]', 'selectedCourseLevels.[]', function(){
    let selectedCourseLevels = this.get('selectedCourseLevels');
    let events = this.get('events');
    if(selectedCourseLevels.length === 0) {
      return events;
    }
    let matchingEvents = [];
    let defer = Ember.RSVP.defer();
    let promises = [];
    events.forEach(event => {
      promises.pushObject(this.get('userEvents').getCourseLevelForEvent(event).then( level => {
        if (selectedCourseLevels.contains(level)) {
          matchingEvents.pushObject(event);
        }
      }));
    });
    
    Ember.RSVP.all(promises).then(()=> {
      defer.resolve(matchingEvents);
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  eventsWithSelectedCohorts: Ember.computed('events.[]', 'selectedCohorts.[]', function(){
    let selectedCohorts = this.get('selectedCohorts').mapBy('id');
    let events = this.get('events');
    if(selectedCohorts.length === 0) {
      return events;
    }
    let matchingEvents = [];
    let defer = Ember.RSVP.defer();
    let promises = [];
    events.forEach(event => {
      promises.pushObject(this.get('userEvents').getCohortIdsForEvent(event).then( cohorts => {
        if (cohorts.any( cohortId => {
          return selectedCohorts.contains(cohortId);
        })) {
          matchingEvents.pushObject(event);
        }
      }));
    });
    
    Ember.RSVP.all(promises).then(()=> {
      defer.resolve(matchingEvents);
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  eventsWithSelectedCourses: Ember.computed('events.[]', 'selectedCourses.[]', function(){
    let selectedCourses = this.get('selectedCourses').mapBy('id');
    let events = this.get('events');
    if(selectedCourses.length === 0) {
      return events;
    }
    let matchingEvents = [];
    let defer = Ember.RSVP.defer();
    let promises = [];
    events.forEach(event => {
      promises.pushObject(this.get('userEvents').getCourseIdForEvent(event).then( courseId => {
        if (selectedCourses.contains(courseId)) {
          matchingEvents.pushObject(event);
        }
      }));
    });
    
    Ember.RSVP.all(promises).then(()=> {
      defer.resolve(matchingEvents);
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  selectedTopics: [],
  topics: Ember.computed('selectedSchool.disciplines.[]', 'selectedTopics.[]', function(){
    return DS.PromiseArray.create({
      promise: this.get('selectedSchool').then(school => {
        return school.get('disciplines').then( topics => {
          return topics.sortBy('title');
        });
      })
    });
  }),
  selectedSessionTypes: [],
  sessionTypes: Ember.computed('selectedSchool.sessionTypes.[]', 'selectedSessionTypes.[]', function(){
    return DS.PromiseArray.create({
      promise: this.get('selectedSchool').then(school => {
        return school.get('sessionTypes').then( types => {
          return types.sortBy('title');
        });
      })
    });
  }),
  selectedCourseLevels: [],
  courseLevels: Ember.computed('selectedCourseLevels.[]', function(){
    let levels = [];
    for(let i =1; i <=5; i++){
      levels.pushObject(i);
    }
    
    return levels;
  }),
  selectedCohorts: [],
  cohorts: Ember.computed('selectedSchool.cohorts.[].displayTitle', 'selectedCohorts.[]', function(){
    return DS.PromiseArray.create({
      promise: this.get('selectedSchool').then(school => {
        return school.get('cohorts').then( cohorts => {
          return cohorts.sortBy('displayTitle');
        });
      })
    });
  }),
  selectedCourses: [],
  allCourses: Ember.computed(function(){
    return DS.PromiseArray.create({
      promise: this.get('selectedSchool').then(school => {
        return school.get('courses');
      })
    });
  }),
  courses: Ember.computed('selectedSchool.courses.[]', 'selectedCourses.[]', function(){
    return DS.PromiseArray.create({
      promise: this.get('selectedSchool').then(school => {
        return school.get('courses').then( courses => {
          return courses.sortBy('title');
        });
      })
    });
  }),
  selectedSchool: Ember.computed('schoolPickedByUser', 'currentUser.model.school', function(){
    if(this.get('schoolPickedByUser')){
      return this.get('schoolPickedByUser');
    }
    
    return DS.PromiseObject.create({
      promise: this.get('currentUser').get('model').then(user => {
        return user.get('school').then(school => {
          return school;
        });
      })
    });
  }),
  schoolPickedByUser: null,
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  allSchools: Ember.computed(function(){
    return DS.PromiseArray.create({
      promise: this.get('currentUser.model').then(user => {
        return user.get('school').then(school => {
          return [school];
        });
      })
    });
  }),
  schools: Ember.computed('allSchools.[]', 'selectedSchool', function(){
    return this.get('allSchools').sortBy('title');
  }),
  actions: {
    setView(view){
      this.sendAction('setView', view);
    },
    goForward(){
      this.sendAction('goForward');
    },
    goBack(){
      this.sendAction('goBack');
    },
    gotoToday(){
      this.sendAction('gotoToday');
    },
    toggleShowFilters(){
      this.set('showFilters', !this.get('showFilters'));
    },
    toggleMySchedule(){
      this.set('mySchedule', !this.get('mySchedule'));
    },
    toggleCourseFilters(){
      this.set('courseFilters', !this.get('courseFilters'));
    },
    toggleTopic(topic){
      if(this.get('selectedTopics').contains(topic)){
        this.get('selectedTopics').removeObject(topic);
      } else {
        this.get('selectedTopics').pushObject(topic);
      }
    },
    toggleSessionType(sessionType){
      if(this.get('selectedSessionTypes').contains(sessionType)){
        this.get('selectedSessionTypes').removeObject(sessionType);
      } else {
        this.get('selectedSessionTypes').pushObject(sessionType);
      }
    },
    toggleCourseLevel(level){
      if(this.get('selectedCourseLevels').contains(level)){
        this.get('selectedCourseLevels').removeObject(level);
      } else {
        this.get('selectedCourseLevels').pushObject(level);
      }
    },
    toggleCohort(cohort){
      if(this.get('selectedCohorts').contains(cohort)){
        this.get('selectedCohorts').removeObject(cohort);
      } else {
        this.get('selectedCohorts').pushObject(cohort);
      }
    },
    toggleCourse(course){
      if(this.get('selectedCourses').contains(course)){
        this.get('selectedCourses').removeObject(course);
      } else {
        this.get('selectedCourses').pushObject(course);
      }
    },
    pickSchool(school){
      this.set('schoolPickedByUser', school);
    },
  }
});
