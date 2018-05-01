import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import EmberObject, { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import layout from '../templates/components/dashboard-calendar';
import moment from 'moment';
import momentFormat from 'ember-moment/computeds/format';

const { all, map } = RSVP;

export default Component.extend({
  layout,
  init() {
    this._super(...arguments);
    //do these on setup otherwise tests were failing because
    //the old filter value hung around
    this.set('selectedSessionTypes', []);
    this.set('selectedCourseLevels', []);
    this.set('selectedCohorts', []);
    this.set('selectedCourses', []);
    this.set('selectedTerms', []);
    this.set('courseLevels', [1, 2, 3, 4, 5]);
  },
  userEvents: service(),
  schoolEvents: service(),
  currentUser: service(),
  store: service(),
  i18n: service(),
  iliosConfig: service(),
  classNames: ['dashboard-calendar'],
  selectedSchool: null,
  selectedDate: null,
  selectedView: null,
  selectedCohorts: null,
  selectedCourseLevels: null,
  selectedCourses: null,
  selectedSessionTypes: null,
  selectedAcademicYear: null,
  selectedTerms: null,

  dayTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.day');
  }),
  weekTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.week');
  }),
  monthTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.month');
  }),
  loadingEventsTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.loadingEvents');
  }),
  icsInstructionsTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.icsInstructions');
  }),
  fromTimeStamp: computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).startOf(this.get('selectedView')).subtract(this.get('skew'), 'days').unix();
  }),
  toTimeStamp: computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).endOf(this.get('selectedView')).add(this.get('skew'), 'days').unix();
  }),
  clockSkew: computed('selectedView', function(){
    if(this.set('selectedView') === 'month'){
      return 6;
    }

    return 1;
  }),
  calendarDate: momentFormat('selectedDate', 'YYYY-MM-DD'),

  /**
   * @property academicYears
   * @type {Ember.computed}
   * @public
   */
  academicYears: computed('allAcademicYears.[]', async function(){
    const years = await this.get('allAcademicYears');
    return years.sortBy('title');
  }),

  /**
   * @property cohorts
   * @type {Ember.computed}
   * @public
   */
  cohorts: computed('bestSelectedSchool', 'bestSelectedAcademicYear', async function(){
    const school = await this.get('bestSelectedSchool');
    const year = await this.get('bestSelectedAcademicYear');
    const cohorts = await school.getCohortsForYear(year.get('title'));
    const cohortProxies = await map(cohorts.toArray(), async cohort => {
      let displayTitle = cohort.get('title');
      if (isEmpty(displayTitle)) {
        const i18n = this.get('i18n');
        const classOfYear = await cohort.get('classOfYear');
        displayTitle = i18n.t('general.classOf', { year: classOfYear });
      }

      return EmberObject.create({
        cohort,
        displayTitle
      });
    });

    return cohortProxies.sortBy('displayTitle').mapBy('cohort');
  }),

  /**
   * @property courseLevels
   * @type {Array}
   * @public
   */
  courseLevels: null,

  /**
   * @property courses
   * @type {Ember.computed}
   * @public
   */
  courses: computed('bestSelectedSchool', 'bestSelectedAcademicYear', async function(){
    const school = await this.get('bestSelectedSchool');
    const year = await this.get('bestSelectedAcademicYear');
    const courses = await this.get('store').query('course', {
      filters: {
        school: school.get('id'),
        year: year.get('title')
      },
    });
    return courses.sortBy('title');
  }),

  /**
   * @property filteredEvents
   * @type {Ember.computed}
   * @public
   */
  filteredEvents: computed(
    'ourEvents.[]',
    'eventsWithSelectedSessionTypes.[]',
    'eventsWithSelectedCourseLevels.[]',
    'eventsWithSelectedCohorts.[]',
    'eventsWithSelectedCourses.[]',
    'eventsWithSelectedTerms.[]',
    async function() {
      const eventTypes = [
        'eventsWithSelectedSessionTypes',
        'eventsWithSelectedCourseLevels',
        'eventsWithSelectedCohorts',
        'eventsWithSelectedCourses',
        'eventsWithSelectedTerms',
      ];
      const allFilteredEvents = await map(eventTypes, async name => {
        return await this.get(name);
      });

      const events = await this.get('ourEvents');

      return events.filter(event => {
        return allFilteredEvents.every(arr => {
          return arr.includes(event);
        });
      });
    }
  ),

  /**
   * @property filterTags
   * @type {Ember.computed}
   * @public
   */
  filterTags: computed('activeFilters.[]', async function() {
    const activeFilters = this.get('activeFilters');

    return map(activeFilters, async (filter) => {
      let hash = { filter };

      if (typeof filter === 'number') {
        hash.class = 'tag-course-level';
        hash.name = `Course Level ${filter}`;
      } else {
        let model = filter.get('constructor.modelName');
        switch (model) {
        case 'session-type':
          hash.class = 'tag-session-type';
          hash.name = filter.get('title');
          break;
        case 'cohort': {
          hash.class = 'tag-cohort';
          let displayTitle = filter.get('title');
          const i18n = this.get('i18n');
          const classOfYear = await filter.get('classOfYear');
          if (isEmpty(displayTitle)) {
            displayTitle = i18n.t('general.classOf', {year: classOfYear});
          }
          const program = await filter.get('programYear.program');
          hash.name = `${displayTitle} ${program.get('title')}`;
          break;
        }
        case 'term': {
          hash.class = 'tag-term';
          const allTitles = await filter.get('titleWithParentTitles');
          const vocabulary = await filter.get('vocabulary');
          const title = vocabulary.get('title');
          hash.name = `${title} > ${allTitles}`;
          break;
        }
        case 'course':
          hash.class = 'tag-course';
          hash.name = filter.get('title');
          break;
        }
      }
      return hash;
    });
  }),

  hasMoreThanOneSchool: computed('allSchools.[]', async function() {
    const schools = await this.get('allSchools');
    return (schools.length > 1);
  }),

  /**
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
  bestSelectedSchool: computed('selectedSchool', 'currentUser.model.school', async function(){
    const selectedSchool = this.get('selectedSchool');
    if (selectedSchool)  {
      return selectedSchool;
    }
    const user = await this.get('currentUser').get('model');
    return await user.get('school');
  }),

  /**
   * @property bestSelectedAcademicYear
   * @type {Ember.computed}
   * @public
   */
  bestSelectedAcademicYear: computed('selectedAcademicYear', 'allAcademicYears.[]', async function(){
    const selectedAcademicYear = this.get('selectedAcademicYear');
    if (selectedAcademicYear) {
      return selectedAcademicYear;
    }
    const years = await this.get('allAcademicYears');
    return years.sortBy('title').get('lastObject');
  }),

  /**
   * @property sessionTypes
   * @type {Ember.computed}
   * @public
   */
  sessionTypes: computed('bestSelectedSchool.sessionTypes.[]', 'selectedSessionTypes.[]', async function(){
    const school = await this.get('bestSelectedSchool');
    const types = await school.get('sessionTypes');
    return types.toArray().sortBy('title');
  }),

  /**
   * @property vocabularies
   * @type {Ember.computed}
   * @public
   */
  vocabularies: computed('bestSelectedSchool.vocabularies.[]', async function(){
    const school = await this.get('bestSelectedSchool');
    const vocabularies = await school.get('vocabularies');
    await all(vocabularies.mapBy('terms'));
    return vocabularies.toArray().sortBy('title');
  }),

  /**
   * @property showClearFilters
   * @type {Ember.computed}
   * @public
   */
  activeFilters: computed('selectedCourses.[]', 'selectedSessionTypes.[]', 'selectedCourseLevels.[]', 'selectedCohorts.[]', 'selectedTerms.[]', function () {
    const a = this.get('selectedSessionTypes');
    const b = this.get('selectedCourseLevels');
    const c = this.get('selectedCohorts');
    const d = this.get('selectedCourses');
    const e = this.get('selectedTerms');

    return [].concat(a, b, c, d, e);
  }),

  /**
   * @property ourEvents
   * @type {Ember.computed}
   * @protected
   */
  ourEvents: computed('mySchedule', 'fromTimeStamp', 'toTimeStamp', 'bestSelectedSchool', 'selectedView', async function(){
    if(this.get('mySchedule')) {
      return await this.get('userEvents').getEvents(this.get('fromTimeStamp'), this.get('toTimeStamp'));
    }
    const school = await this.get('bestSelectedSchool');
    return await this.get('schoolEvents').getEvents(school.get('id'), this.get('fromTimeStamp'), this.get('toTimeStamp'));
  }),

  /**
   * @property eventsWithSelectedSessionTypes
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedSessionTypes: computed('ourEvents.[]', 'selectedSessionTypes.[]', async function(){
    const events = await this.get('ourEvents');
    const selectedSessionTypes = this.get('selectedSessionTypes').mapBy('id');
    if(isEmpty(selectedSessionTypes)) {
      return events;
    }
    const matchingEvents = await map(events, async event => {
      if(event.ilmSession || event.offering) {
        const id = await this.get('userEvents').getSessionTypeIdForEvent(event);
        if (selectedSessionTypes.includes(id)) {
          return event;
        }
      }
      return null;
    });

    return matchingEvents.filter(event => {
      return ! isEmpty(event);
    });
  }),

  /**
   * @property eventsWithSelectedCourseLevels
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedCourseLevels: computed('ourEvents.[]', 'selectedCourseLevels.[]', async function(){
    const events = await this.get('ourEvents');
    const selectedCourseLevels = this.get('selectedCourseLevels');
    if(isEmpty(selectedCourseLevels)) {
      return events;
    }
    const matchingEvents = await map(events, async event => {
      if(event.ilmSession || event.offering) {
        const level = await this.get('userEvents').getCourseLevelForEvent(event);
        if (selectedCourseLevels.includes(level)) {
          return event;
        }
      }
      return null;
    });

    return matchingEvents.filter(event => {
      return ! isEmpty(event);
    });
  }),

  /**
   * @property eventsWithSelectedCohorts
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedCohorts: computed('ourEvents.[]', 'selectedCohorts.[]', async function(){
    const events = await this.get('ourEvents');
    const selectedCohorts = this.get('selectedCohorts').mapBy('id');
    if(isEmpty(selectedCohorts)) {
      return events;
    }
    const matchingEvents = await map(events, async event => {
      if (event.ilmSession || event.offering) {
        const cohorts = await this.get('userEvents').getCohortIdsForEvent(event);
        if(cohorts.any(cohortId => {
          return selectedCohorts.includes(cohortId);
        })) {
          return event;
        }
      }
      return null;
    });

    return matchingEvents.filter(event => {
      return ! isEmpty(event);
    });
  }),

  /**
   * @property eventsWithSelectedCourses
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedCourses: computed('ourEvents.[]', 'selectedCourses.[]', async function(){
    const events = await this.get('ourEvents');
    const selectedCourses = this.get('selectedCourses').mapBy('id');
    if(isEmpty(selectedCourses)) {
      return events;
    }

    const matchingEvents = await map(events, async event => {
      if(event.ilmSession || event.offering) {
        const courseId = await this.get('userEvents').getCourseIdForEvent(event);
        if(selectedCourses.includes(courseId)) {
          return event;
        }
      }
      return null;
    });

    return matchingEvents.filter(event => {
      return ! isEmpty(event);
    });
  }),

  /**
   * @property eventsWithSelectedTerms
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedTerms: computed('ourEvents.[]', 'selectedTerms.[]', async function(){
    const events = await this.get('ourEvents');
    const selectedTerms = this.get('selectedTerms').mapBy('id');
    if(isEmpty(selectedTerms)) {
      return events;
    }
    const matchingEvents = await map(events, async event => {
      if (event.ilmSession || event.offering) {

        const termIds = await this.get('userEvents').getTermIdsForEvent(event);
        if(termIds.any(termId => {
          return selectedTerms.includes(termId);
        })) {
          return event;
        }
      }
      return null;
    });

    return matchingEvents.filter(event => {
      return ! isEmpty(event);
    });
  }),

  /**
   * @property allSchools
   * @type {Ember.computed}
   * @protected
   */
  allSchools: computed(async function () {
    const store = this.get('store');
    return store.findAll('school');
  }),

  /**
   * @property allAcademicYears
   * @type {Ember.computed}
   * @protected
   */
  allAcademicYears: computed(function(){
    return this.get('store').findAll('academic-year');
  }),

  /**
   * @property absoluteIcsUri
   * @type {Ember.computed}
   * @protected
   */
  absoluteIcsUri: computed('currentUser.model.icsFeedKey', async function () {
    const currentUser = this.get('currentUser');
    const iliosConfig = this.get('iliosConfig');
    const model = await currentUser.get('model');
    const icsFeedKey = model.get('icsFeedKey');
    const apiHost = iliosConfig.get('apiHost');
    const loc = window.location.protocol + '//' + window.location.hostname;
    const server = apiHost ? apiHost : loc;
    return server + '/ics/' + icsFeedKey;
  }),

  actions: {
    toggleSessionType(sessionType){
      if(this.get('selectedSessionTypes').includes(sessionType)){
        this.get('selectedSessionTypes').removeObject(sessionType);
      } else {
        this.get('selectedSessionTypes').pushObject(sessionType);
      }
    },
    toggleCourseLevel(level){
      if(this.get('selectedCourseLevels').includes(level)){
        this.get('selectedCourseLevels').removeObject(level);
      } else {
        this.get('selectedCourseLevels').pushObject(level);
      }
    },
    toggleCohort(cohort){
      if(this.get('selectedCohorts').includes(cohort)){
        this.get('selectedCohorts').removeObject(cohort);
      } else {
        this.get('selectedCohorts').pushObject(cohort);
      }
    },
    toggleCourse(course){
      if(this.get('selectedCourses').includes(course)){
        this.get('selectedCourses').removeObject(course);
      } else {
        this.get('selectedCourses').pushObject(course);
      }
    },
    toggleTerm(term){
      if(this.get('selectedTerms').includes(term)){
        this.get('selectedTerms').removeObject(term);
      } else {
        this.get('selectedTerms').pushObject(term);
      }
    },

    clearFilters() {
      const selectedCourses = [];
      const selectedSessionTypes = [];
      const selectedCourseLevels = [];
      const selectedCohorts = [];
      const selectedTerms = [];

      this.setProperties({ selectedCourses, selectedSessionTypes, selectedCourseLevels, selectedCohorts, selectedTerms });
    },

    removeFilter(filter) {
      if (typeof filter === 'number') {
        this.send('toggleCourseLevel', filter);
      } else {
        let model = filter.get('constructor.modelName');

        switch (model) {
        case 'session-type':
          this.send('toggleSessionType', filter);
          break;
        case 'cohort':
          this.send('toggleCohort', filter);
          break;
        case 'course':
          this.send('toggleCourse', filter);
          break;
        case 'term':
          this.send('toggleTerm', filter);
          break;
        }
      }
    }
  }
});
