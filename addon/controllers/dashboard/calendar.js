import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';
import { findById } from '../../utils/array-helpers';

export default class DashboardCalendarController extends Controller {
  @service currentUser;
  @service router;
  @service store;

  queryParams = [
    'cohorts',
    'courseFilters',
    'courseLevels',
    'courses',
    'date',
    'mySchedule',
    'school',
    'sessionTypes',
    'showFilters',
    'terms',
    'view',
  ];

  @tracked courseFilters = true;
  @tracked cohorts = '';
  @tracked courseLevels = '';
  @tracked courses = '';
  @tracked terms = '';
  @tracked sessionTypes = '';
  @tracked date = null;
  @tracked mySchedule = true;
  @tracked school = null;
  @tracked showFilters = false;
  @tracked view = 'week';

  get selectedSchool() {
    const { schools } = this.model;
    return findById(schools, this.school);
  }

  get selectedDate() {
    if (this.date) {
      return moment(this.date, 'YYYY-MM-DD').format();
    }

    return moment().format();
  }

  get selectedView() {
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
    this.router.transitionTo('events', event.slug);
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
      const idArray = str.split('-');
      if (!idArray.includes(id)) {
        this[what] = str + `-${id}`;
      }
    } else {
      this[what] = id;
    }
  }

  @action
  remove(what, id) {
    const str = this[what];
    if (str) {
      const idArray = str.split('-');
      if (idArray.includes(id)) {
        idArray.splice(idArray.indexOf(id), 1);
        this[what] = idArray.join('-');
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
