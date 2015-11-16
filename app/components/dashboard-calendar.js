import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';
import momentFormat from 'ember-moment/computeds/format';

const { computed, isPresent, RSVP, inject } = Ember;
const { PromiseObject } = DS;
const { service } = inject;

export default Ember.Component.extend({
  userEvents: service(),
  schoolEvents: service(),
  currentUser: service(),
  store: service(),
  i18n: service(),
  selectedDate: null,
  selectedView: null,

  dueTranslation: Ember.computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.dueThisDay');
  }),
  dayTranslation: Ember.computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.day');
  }),
  weekTranslation: Ember.computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.week');
  }),
  monthTranslation: Ember.computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.month');
  }),
  loadingEventsTranslation: Ember.computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.loadingEvents');
  }),
  icsInstructionsTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('calendar.icsInstructions');
  }),
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
  calendarDate: momentFormat('selectedDate', 'YYYY-MM-DD'),
  ourEvents: Ember.computed('mySchedule', 'fromTimeStamp', 'toTimeStamp', 'selectedSchool', 'selectedView', function(){
    if(this.get('mySchedule')) {
      return DS.PromiseArray.create({
        promise: this.get('userEvents').getEvents(this.get('fromTimeStamp'), this.get('toTimeStamp'))
      });
    } else {
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
    'ourEvents.[]',
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
        this.get('ourEvents').then(events => {
          let filteredEvents = events.filter(event => {
            return allFilteredEvents.every(arr => {
              let bool = arr.contains(event);

              return bool;
            });
          });
          defer.resolve(filteredEvents);
        });
      });
      return DS.PromiseArray.create({
        promise: defer.promise
      });

  }),
  eventsWithSelectedTopics: Ember.computed('ourEvents.[]', 'selectedTopics.[]', function(){
    let selectedTopics = this.get('selectedTopics');
    if(selectedTopics.length === 0) {
      return this.get('ourEvents');
    }
    selectedTopics = selectedTopics.mapBy('id');
    let matchingEvents = [];
    let defer = Ember.RSVP.defer();
    let promises = [];
    this.get('ourEvents').forEach(event => {
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
  eventsWithSelectedSessionTypes: Ember.computed('ourEvents.[]', 'selectedSessionTypes.[]', function(){
    let selectedSessionTypes = this.get('selectedSessionTypes').mapBy('id');
    let events = this.get('ourEvents');
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
  eventsWithSelectedCourseLevels: Ember.computed('ourEvents.[]', 'selectedCourseLevels.[]', function(){
    let selectedCourseLevels = this.get('selectedCourseLevels');
    let events = this.get('ourEvents');
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
  eventsWithSelectedCohorts: Ember.computed('ourEvents.[]', 'selectedCohorts.[]', function(){
    let selectedCohorts = this.get('selectedCohorts').mapBy('id');
    let events = this.get('ourEvents');
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
  eventsWithSelectedCourses: Ember.computed('ourEvents.[]', 'selectedCourses.[]', function(){
    let selectedCourses = this.get('selectedCourses').mapBy('id');
    let events = this.get('ourEvents');
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
  topics: Ember.computed('selectedSchool.topics.[]', 'selectedTopics.[]', function(){
    return DS.PromiseArray.create({
      promise: this.get('selectedSchool').then(school => {
        return school.get('topics').then( topics => {
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
  allCohorts: Ember.computed('selectedSchool', 'selectedAcademicYear', function(){
    let defer = Ember.RSVP.defer();
    this.get('selectedSchool').then(school => {
      this.get('selectedAcademicYear').then(year => {
        school.getCohortsForYear(year.get('title')).then(cohorts => {
          defer.resolve(cohorts.sortBy('displayTitle'));
        });
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  cohorts: Ember.computed('allCohorts.[].displayTitle', 'selectedCohorts.[]', function(){
    return this.get('allCohorts');
  }),
  selectedCourses: [],
  allCourses: Ember.computed('selectedSchool', 'selectedAcademicYear', function(){
    let defer = Ember.RSVP.defer();
    this.get('selectedSchool').then((school) => {
      this.get('selectedAcademicYear').then((year) => {
        this.get('store').query('course', {
          filters: {
            school: school.get('id'),
            year: year.get('title')
          },
          limit: 1000
        }).then((courses) => {
          defer.resolve(courses.sortBy('title'));
        });
      });
    });
    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  courses: Ember.computed('allCourses.[]', 'selectedCourses.[]', function(){
    return this.get('allCourses');
  }),
  selectedSchool: computed('schoolPickedByUser', 'currentUser.model.school', function(){
    let defer = RSVP.defer();

    if(this.get('schoolPickedByUser')){
      defer.resolve(this.get('schoolPickedByUser'));
    } else {
      this.get('currentUser').get('model').then(user => {
        user.get('school').then(school => {
          defer.resolve(school);
        });
      });
    }

    return PromiseObject.create({
      promise: defer.promise
    });
  }),
  hasMoreThanOneSchool: Ember.computed.gt('schools.length', 1),
  allSchools: Ember.computed(function(){
    return DS.PromiseArray.create({
      promise: this.get('currentUser.model').then(user => {
        return user.get('schools').then(schools => {
          return schools;
        });
      })
    });
  }),
  schools: Ember.computed('allSchools.[]', 'selectedSchool', function(){
    return this.get('allSchools').sortBy('title');
  }),
  selectedAcademicYear: Ember.computed('academicYearSelectedByUser', function(){
    if(this.get('academicYearSelectedByUser')){
      //wrap it in a proxy so the is-equal comparison works the same as the promise
      return DS.PromiseObject.create({
        promise: Ember.RSVP.resolve(this.get('academicYearSelectedByUser'))
      });
    }

    return DS.PromiseObject.create({
      promise: this.get('allAcademicYears').then(years => {
        return years.sortBy('title').get('lastObject');
      })
    });
  }),
  allAcademicYears: Ember.computed(function(){
    return this.get('store').findAll('academic-year');
  }),
  academicYears: Ember.computed('allAcademicYears.[]', 'academicYearSelectedByUser', function(){
    return DS.PromiseArray.create({
      promise: this.get('allAcademicYears').then(years => {
        return years.sortBy('title');
      })
    });
  }),

  showClearFilters: computed('selectedCourses.[]', 'selectedSessionTypes.[]', 'selectedTopics.[]', 'selectedCourseLevels.[]', 'selectedCohorts.[]', {
    get() {
      const a = this.get('selectedTopics');
      const b = this.get('selectedSessionTypes');
      const c = this.get('selectedCourseLevels');
      const d = this.get('selectedCohorts');
      const e = this.get('selectedCourses');

      let results = a.concat(b, c, d, e);
      this.set('activeFilters', results);

      return isPresent(results) ? true : false;
    }
  }).readOnly(),

  activeFilters: null,

  filterTags: computed('activeFilters', {
    get() {
      const activeFilters = this.get('activeFilters');

      return activeFilters.map((filter) => {
        let hash = {};
        hash.filter = filter;

        if (typeof filter === 'number') {
          hash.class = 'tag-course-level';
          hash.name = `Course Level ${filter}`;
        } else {
          let model = filter.get('constructor.modelName');

          switch (model) {
            case 'topic':
              hash.class = 'tag-topic';
              hash.name = filter.get('title');
              break;
            case 'session-type':
              hash.class = 'tag-session-type';
              hash.name = filter.get('title');
              break;
            case 'cohort':
              hash.class = 'tag-cohort';
              hash.name = `${filter.get('displayTitle')} ${filter.get('programYear.program.title')}`;
              break;
            case 'course':
              hash.class = 'tag-course';
              hash.name = filter.get('title');
              break;
          }
        }

        return hash;
      });
    }
  }),

  actions: {
    changeDate(newDate){
      this.sendAction('changeDate', newDate);
    },
    changeView(newView){
      this.sendAction('changeView', newView);
    },
    selectEvent(event){
      this.sendAction('selectEvent', event);
    },
    toggleShowFilters() {
      this.sendAction('toggleShowFilters');
    },
    toggleMySchedule() {
      this.sendAction('toggleMySchedule');
    },
    toggleCourseFilters() {
      this.sendAction('toggleCourseFilters');
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

    pickSchool() {
      let selectedEl = this.$('.calendar-school-picker select')[0];
      let selectedIndex = selectedEl.selectedIndex;
      const schools = this.get('schools');
      let school = schools.toArray()[selectedIndex];

      this.sendAction('changeSchool', school);
    },

    changeSelectedYear() {
      let selectedEl = this.$('.calendar-year-picker select')[0];
      let selectedIndex = selectedEl.selectedIndex;
      this.get('academicYears').then(years => {
        let year = years.toArray()[selectedIndex];

        this.sendAction('changeAcademicYear', year);
      });
    },

    clearFilters() {
      const selectedCourses = [];
      const selectedSessionTypes = [];
      const selectedTopics = [];
      const selectedCourseLevels = [];
      const selectedCohorts = [];

      this.setProperties({ selectedCourses, selectedSessionTypes, selectedTopics, selectedCourseLevels, selectedCohorts });
    },

    removeFilter(filter) {
      if (typeof filter === 'number') {
        this.send('toggleCourseLevel', filter);
      } else {
        let model = filter.get('constructor.modelName');

        switch (model) {
          case 'topic':
            this.send('toggleTopic', filter);
            break;
          case 'session-type':
            this.send('toggleSessionType', filter);
            break;
          case 'cohort':
            this.send('toggleCohort', filter);
            break;
          case 'course':
            this.send('toggleCourse', filter);
            break;
        }
      }
    }
  }
});
