import Ember from 'ember';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';

const { Component, inject, computed, isEmpty } = Ember;
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
    for (let i = 0; i < 10; i++) {
      years.push(thisYear + i);
    }
    this.set('years', years);
    this.set('selectedYear', thisYear);
  },
  host: reads('serverVariables.apiHost'),
  namespace: reads('serverVariables.apiNameSpace'),
  classNames: ['course-rollover'],
  years: [],
  selectedYear: null,
  course: null,
  expandAdvancedOptions: false,

  save: task(function * (){
    yield timeout(10);
    const ajax = this.get('ajax');
    const courseId = this.get('course.id');
    const selectedYear = this.get('selectedYear');

    if (isEmpty(selectedYear)) {
      throw new Error("no year selected");
    }
    const host = this.get('host')?this.get('host'):'/';
    const namespace = this.get('namespace');

    let url = host + namespace + `/courses/${courseId}/rollover`;
    const newCoursesObj = yield ajax.request(url, {
      method: 'POST',
      data: {
        year: selectedYear
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
});
