import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';

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

  @tracked academicYear = null;
  @tracked cohorts = '';
  @tracked courseFilters = true;
  @tracked courseLevels = '';
  @tracked courses = '';
  @tracked date = null;
  @tracked mySchedule = true;
  @tracked school = null;
  @tracked sessionTypes = '';
  @tracked show = 'week';
  @tracked showFilters = false;
  @tracked terms = '';
  @tracked view = 'week';

  get selectedAcademicYear(){
    const { academicYears } = this.model;

    return academicYears.findBy('id', this.academicYear);
  }

  get selectedSchool(){
    const { schools } = this.model;

    return schools.findBy('id', this.school);
  }

  get selectedDate(){
    if (this.date) {
      return moment(this.date, 'YYYY-MM-DD').format();
    }

    return moment().format();
  }

  get selectedView(){
    if (!['month', 'week', 'day'].includes(this.view)) {
      return 'week';
    }

    return this.view;
  }

  @action
  changeDate(newDate) {
    this.date = moment(newDate).format('YYYY-MM-DD');
  }

  @action
  selectEvent(event) {
    this.transitionToRoute('events', event.slug);
  }

  @action
  toggleMySchedule() {
    if (this.mySchedule) {
      this.mySchedule = false;
      this.school = null;
    } else {
      this.mySchedule = true;
    }
  }

  @action
  toggleShowFilters() {
    if (this.showFilters) {
      this.showFilters = false;
      this.school = null;
      this.academicYear = null;
      this.courseFilters = null;
    } else {
      this.showFilters = true;
    }
  }

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
  }

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
  }

  @action
  clearFilters() {
    this.cohorts = '';
    this.courseLevels = '';
    this.courses = '';
    this.sessionTypes = '';
    this.terms = '';
  }
}
