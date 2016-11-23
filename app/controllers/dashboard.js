import Ember from 'ember';
import moment from 'moment';

const { computed, Controller, inject } = Ember;
const { service } = inject;

export default Controller.extend({
  queryParams: [
    'date',
    'view',
    'mySchedule',
    'showFilters',
    'courseFilters',
    'school',
    'academicYear',
    'show',
  ],
  date: null,
  view: 'week',
  mySchedule: true,
  showFilters: false,
  courseFilters: true,
  academicYear: null,
  school: null,
  show: 'agenda',

  currentUser: service(),

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

    setShow(what) {
      if (!['agenda', 'materials', 'calendar'].contains(what)) {
        what = 'agenda';
      }

      this.set('show', what);
    }
  }
});
