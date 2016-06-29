import Ember from 'ember';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';

const { Component, inject, computed, isPresent } = Ember;
const { service } = inject;
const { reads } = computed;

export default Component.extend({
  ajax: service(),
  store: service(),
  flashMessages: service(),
  serverVariables: service(),
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('loadUnavailableYears').perform();
    let thisYear = parseInt(moment().format('YYYY'));
    let years = [];
    for (let i = 0; i < 5; i++) {
      years.push(thisYear + i);
    }
    this.set('years', years);

    this.get('changeSelectedYear').perform(thisYear);
  },
  host: reads('serverVariables.apiHost'),
  namespace: reads('serverVariables.apiNameSpace'),
  classNames: ['course-rollover'],
  years: [],
  selectedYear: null,
  course: null,
  expandAdvancedOptions: false,
  startDate: null,
  skipOfferings: false,

  save: task(function * (){
    yield timeout(10);
    const ajax = this.get('ajax');
    const courseId = this.get('course.id');
    const expandAdvancedOptions = this.get('expandAdvancedOptions');
    const selectedYear = this.get('selectedYear');
    let newStartDate = null;
    let skipOfferings = false;

    if (expandAdvancedOptions) {
      newStartDate = moment(this.get('startDate')).format('YYYY-MM-DD');
      skipOfferings = this.get('skipOfferings');
    }
    const host = this.get('host')?this.get('host'):'/';
    const namespace = this.get('namespace');

    let url = host + namespace + `/courses/${courseId}/rollover`;
    const newCoursesObj = yield ajax.request(url, {
      method: 'POST',
      data: {
        year: selectedYear,
        newStartDate,
        skipOfferings,
      }
    });

    const flashMessages = this.get('flashMessages');
    const store = this.get('store');
    flashMessages.success('courses.rolloverSuccess');
    store.pushPayload(newCoursesObj);
    let newCourse = store.peekRecord('course', newCoursesObj.courses[0].id);

    return this.get('visit')(newCourse);
  }).drop(),

  loadUnavailableYears: task(function * (){
    const course = this.get('course');
    const store = this.get('store');
    let existingCoursesWithTitle = yield store.query('course', {
      filters: {title: course.get('title')}
    });

    return existingCoursesWithTitle.mapBy('year');
  }).drop(),

  changeSelectedYear: task(function * (selectedYear){
    this.setProperties({selectedYear});
    yield timeout(100); //let max/min cp's recalculate

    const date = moment(this.get('course.startDate'));
    const day = date.day();
    const week = date.isoWeek();

    let startDate = moment().year(selectedYear).isoWeek(week).day(day).toDate();
    this.setProperties({startDate});
  }).restartable(),

  minDate: computed('selectedYear', function(){
    const selectedYear = this.get('selectedYear');
    let today = moment();
    if (isPresent(selectedYear)) {
      today.year(selectedYear);
    }
    return today.dayOfYear(1).toDate();
  }),

  maxDate: computed('selectedYear', function(){
    const selectedYear = this.get('selectedYear');
    let today = moment();
    if (isPresent(selectedYear)) {
      today.year(selectedYear+1);
    }
    return today.dayOfYear(365).toDate();
  }),

  actions: {
    selectStartDate(selectedDate) {
      this.set('startDate', selectedDate);
    },
  }
});
