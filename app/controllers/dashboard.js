import Ember from 'ember';
import moment from 'moment';

const { computed, Controller, inject } = Ember;
const { service } = inject;

export default Controller.extend({
  queryParams: ['date', 'view', 'showCalendar', 'mySchedule', 'showFilters', 'courseFilters', 'school', 'academicYear'],
  date: null,
  view: 'week',
  showCalendar: false,
  mySchedule: true,
  showFilters: false,
  courseFilters: true,
  academicYear: null,
  school: null,

  currentUser: service(),

  academicYearSelectedByUser: computed('academicYear', {
    get() {
      const academicYear = this.get('academicYear');
      const { academicYears } = this.get('model');

      return academicYears.find((year) => year.get('title') === parseInt(academicYear));
    },

    set(key, value) {
      this.set('academicYear', value.get('title'));

      return value;
    }
  }),

  schoolPickedByUser: computed('school', {
    get() {
      const school = this.get('school');
      const { schools } = this.get('model');

      return schools.find((availableSchool) => availableSchool.get('title') === school);
    },

    set(key, value) {
      this.set('school', value.get('title'));

      return value;
    }
  }),

  selectedDate: computed('date', {
    get() {
      const date = this.get('date');

      if (date) {
        return moment(date, 'YYYY-MM-DD').format();
      }

      return moment().format();
    }
  }),

  selectedView: computed('view', {
    get() {
      let view = this.get('view');
      let viewOptions = ['month', 'week', 'day'];

      if (viewOptions.indexOf(view) === -1) {
        view = 'week';
      }

      return view;
    }
  }),

  actions: {
    changeDate(newDate) {
      this.set('date', moment(newDate).format('YYYY-MM-DD'));
    },

    changeView(newView) {
      this.set('view', newView);
    },

    selectEvent(event) {
      this.transitionToRoute('events', event.slug);
    },

    toggleShowCalendar() {
      if (this.get('showCalendar')) {
        this.setProperties({ showCalendar: false, mySchedule: true, showFilters: false, school: null, academicYear: null, courseFilters: true });
      } else {
        this.set('showCalendar', true);
      }
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

    toggleCourseFilters() {
      this.set('courseFilters', !this.get('courseFilters'));
    },

    changeAcademicYear(year) {
      this.set('academicYearSelectedByUser', year);
    },

    changeSchool(school) {
      this.set('schoolPickedByUser', school);
    }
  }
});
