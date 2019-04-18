import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';
import moment from 'moment';

export default Mixin.create({
  currentUser: service(),
  store: service(),

  queryParams: [
    'academicYear',
    'cohorts',
    'courseFilters',
    'courseLevels',
    'courses',
    'date',
    'mySchedule',
    'school',
    'sessionTypes',
    'show',
    'showFilters',
    'terms',
    'view'
  ],

  academicYear: null,
  cohorts: '',
  courseFilters: true,
  courseLevels: '',
  courses: '',
  date: null,
  mySchedule: true,
  school: null,
  sessionTypes: '',
  show: 'week',
  showFilters: false,
  terms: '',
  view: 'week',

  selectedCohorts: computed('cohorts', async function() {
    const cohortIds = this.cohorts;
    return cohortIds ? await all(this.fetchModels(cohortIds, 'cohort')) : [];
  }),

  selectedCourseLevels: computed('courseLevels', function() {
    const courseLevels = this.courseLevels;
    return courseLevels
      ? courseLevels.split(',').map((level) => parseInt(level, 10))
      : [];
  }),

  selectedCourses: computed('courses', async function() {
    const courseIds = this.courses;
    return courseIds ? await all(this.fetchModels(courseIds, 'course')) : [];
  }),

  selectedSessionTypes: computed('sessionTypes', async function() {
    const sessionTypeIds = this.sessionTypes;
    return sessionTypeIds
      ? await all(this.fetchModels(sessionTypeIds, 'session-type'))
      : [];
  }),

  selectedTerms: computed('terms', async function() {
    const termIds = this.terms;
    return termIds ? await all(this.fetchModels(termIds, 'term')) : [];
  }),

  selectedAcademicYear: computed('academicYear', 'model.academicYears.[]', function(){
    const academicYear = this.get('academicYear');
    const { academicYears } = this.get('model');

    return academicYears.findBy('id', academicYear);
  }),

  selectedSchool: computed('school', 'model.schools.[]', function(){
    const schoolId = this.get('school');
    const { schools } = this.get('model');

    return schools.findBy('id', schoolId);
  }),

  selectedDate: computed('date', function(){
    const date = this.get('date');

    if (date) {
      return moment(date, 'YYYY-MM-DD').format();
    }

    return moment().format();
  }),
  selectedView: computed('view', function(){
    let view = this.get('view');
    let viewOptions = ['month', 'week', 'day'];

    if (viewOptions.indexOf(view) === -1) {
      view = 'week';
    }

    return view;
  }),

  fetchModels(ids, modelName) {
    const store = this.store;
    return ids.split(',').map((id) => {
      const model = store.peekRecord(modelName, id);
      return model ? model : store.findRecord(modelName, id);
    });
  },

  actions: {
    changeDate(newDate) {
      this.set('date', moment(newDate).format('YYYY-MM-DD'));
    },

    selectEvent(event) {
      this.transitionToRoute('events', event.slug);
    },

    toggleMySchedule() {
      if (this.get('mySchedule')) {
        this.setProperties({ mySchedule: false, school: null });
      } else {
        this.set('mySchedule', true);
      }
    },

    toggleShowFilters() {
      if (this.get('showFilters')) {
        this.setProperties({ showFilters: false, school: null, academicYear: null, courseFilters: true });
      } else {
        this.set('showFilters', true);
      }
    },

    updateCohorts(cohortId) {
      const cohortIds = this.cohorts;

      if (cohortIds) {
        const idArray = cohortIds.split(',');

        if (idArray.includes(cohortId)) {
          idArray.removeObject(cohortId);
          this.set('cohorts', idArray.join(','));
        } else {
          this.set('cohorts', cohortIds + `,${cohortId}`);
        }
      } else {
        this.set('cohorts', cohortId);
      }
    },

    updateCourseLevels(level) {
      const id = level.toString();
      const levels = this.courseLevels;

      if (levels) {
        const idArray = levels.split(',');

        if (idArray.includes(id)) {
          idArray.removeObject(id);
          this.set('courseLevels', idArray.join(','));
        } else {
          this.set('courseLevels', levels + `,${id}`);
        }
      } else {
        this.set('courseLevels', id);
      }
    },

    updateCourses(courseId) {
      const courseIds = this.courses;

      if (courseIds) {
        const idArray = courseIds.split(',');

        if (idArray.includes(courseId)) {
          idArray.removeObject(courseId);
          this.set('courses', idArray.join(','));
        } else {
          this.set('courses', courseIds + `,${courseId}`);
        }
      } else {
        this.set('courses', courseId);
      }
    },

    updateSessionTypes(sessionTypeId) {
      const sessionTypeIds = this.sessionTypes;

      if (sessionTypeIds) {
        const idArray = sessionTypeIds.split(',');

        if (idArray.includes(sessionTypeId)) {
          idArray.removeObject(sessionTypeId);
          this.set('sessionTypes', idArray.join(','));
        } else {
          this.set('sessionTypes', sessionTypeIds + `,${sessionTypeId}`);
        }
      } else {
        this.set('sessionTypes', sessionTypeId);
      }
    },

    updateTerms(term) {
      const termId = term.id;
      const termIds = this.terms;

      if (termIds) {
        const idArray = termIds.split(',');

        if (idArray.includes(termId)) {
          idArray.removeObject(termId);
          this.set('terms', idArray.join(','));
        } else {
          this.set('terms', termIds + `,${termId}`);
        }
      } else {
        this.set('terms', termId);
      }
    },

    clearFilters() {
      this.setProperties({
        cohorts: '', courseLevels: '', courses: '', sessionTypes: '', terms: ''
      });
    }
  }
});
