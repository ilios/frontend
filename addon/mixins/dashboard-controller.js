import Mixin from '@ember/object/mixin';
import { computed, action } from '@ember/object';
import { inject as service } from '@ember/service';
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
    const viewOptions = ['month', 'week', 'day'];

    if (viewOptions.indexOf(view) === -1) {
      view = 'week';
    }

    return view;
  }),

  @action
  changeDate(newDate) {
    this.set('date', moment(newDate).format('YYYY-MM-DD'));
  },

  @action
  selectEvent(event) {
    this.transitionToRoute('events', event.slug);
  },

  @action
  toggleMySchedule() {
    if (this.get('mySchedule')) {
      this.setProperties({ mySchedule: false, school: null });
    } else {
      this.set('mySchedule', true);
    }
  },

  @action
  toggleShowFilters() {
    if (this.get('showFilters')) {
      this.setProperties({ showFilters: false, school: null, academicYear: null, courseFilters: true });
    } else {
      this.set('showFilters', true);
    }
  },

  @action
  add(what, id) {
    const str = this[what];
    if (str) {
      const idArray = str.split(',');
      if (!idArray.includes(id)) {
        this.set(what, str + `,${id}`);
      }
    } else {
      this.set(what, id);
    }
  },
  @action
  remove(what, id) {
    const str = this[what];
    if (str) {
      const idArray = str.split(',');
      if (idArray.includes(id)) {
        idArray.removeObject(id);
        this.set(what, idArray.join(','));
      }
    }
  },

  @action
  clearFilters() {
    this.setProperties({
      cohorts: '', courseLevels: '', courses: '', sessionTypes: '', terms: ''
    });
  }

});
