import Controller from '@ember/controller';
import { action, computed, set } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';

export default class DashboardController extends Controller {
  @service currentUser;
  @service store;

  queryParams = [
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
  ];

  academicYear = null;
  courseFilters = true;
  cohorts = '';
  courseLevels = '';
  courses = '';
  terms = '';
  sessionTypes = '';
  date = null;
  mySchedule = true;
  school = null;
  show = 'week';
  showFilters = false;
  view = 'week';

  @computed("academicYear")
  get selectedAcademicYear(){
    const { academicYears } = this.model;

    return academicYears.findBy('id', this.academicYear);
  }

  @computed("school")
  get selectedSchool(){
    const { schools } = this.model;

    return schools.findBy('id', this.school);
  }

  @computed("date")
  get selectedDate(){
    if (this.date) {
      return moment(this.date, 'YYYY-MM-DD').format();
    }

    return moment().format();
  }

  @computed("view")
  get selectedView() {
    if (!['month', 'week', 'day'].includes(this.view)) {
      return 'week';
    }

    return this.view;
  }

  @action
  changeDate(newDate) {
    set(this, 'date', moment(newDate).format('YYYY-MM-DD'));
  }

  @action
  selectEvent(event) {
    this.transitionToRoute('events', event.slug);
  }

  @action
  toggleMySchedule() {
    if (this.mySchedule) {
      /*
       * Temporary setter needed to avoid issues with QP tracking
       * ref: https://github.com/emberjs/ember.js/issues/18715
      */
      set(this, 'mySchedule', false);
      set(this, 'school', null);
    } else {
      set(this, 'mySchedule', true);
    }
  }

  @action
  toggleShowFilters() {
    if (this.showFilters) {
      /*
       * Temporary setter needed to avoid issues with QP tracking
       * ref: https://github.com/emberjs/ember.js/issues/18715
      */
      set(this, 'showFilters', false);
      set(this, 'school', null);
      set(this, 'academicYear', null);
      set(this, 'courseFilters', null);
    } else {
      set(this, 'showFilters', true);
    }
  }

  @action
  add(what, id) {
    const str = this[what];
    if (str) {
      const idArray = str.split('-');
      if (!idArray.includes(id)) {
        /*
         * Temporary setter needed to avoid issues with QP tracking
         * ref: https://github.com/emberjs/ember.js/issues/18715
        */
        set(this, what, str + `-${id}`);
      }
    } else {
      set(this, what, id);
    }
  }

  @action
  remove(what, id) {
    const str = this[what];
    if (str) {
      const idArray = str.split('-');
      if (idArray.includes(id)) {
        idArray.removeObject(id);
        /*
         * Temporary setter needed to avoid issues with QP tracking
         * ref: https://github.com/emberjs/ember.js/issues/18715
        */
        set(this, what, idArray.join('-'));
      }
    }
  }

  @action
  clearFilters() {
    set(this, 'cohorts', '');
    set(this, 'courseLevels', '');
    set(this, 'courses', '');
    set(this, 'sessionTypes', '');
    set(this, 'terms', '');
  }
}
