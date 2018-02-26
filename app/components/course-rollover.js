/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { reads } = computed;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
  selectedYear: [
    validator('presence', true)
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  commonAjax: service(),
  store: service(),
  flashMessages: service(),
  iliosConfig: service(),
  init() {
    this._super(...arguments);
    this.set('selectedCohorts', []);
  },
  didReceiveAttrs(){
    this._super(...arguments);
    let lastYear = parseInt(moment().subtract(1, 'year').format('YYYY'), 10);
    let years = [];
    for (let i = 0; i < 6; i++) {
      years.push(lastYear + i);
    }
    this.set('years', years);
    const course = this.get('course');
    if (isPresent(course)) {
      this.set('title', course.get('title'));
    }

    this.get('loadUnavailableYears').perform();
    this.get('changeSelectedYear').perform(lastYear);
  },
  host: reads('iliosConfig.apiHost'),
  namespace: reads('iliosConfig.apiNameSpace'),
  classNames: ['course-rollover'],
  years: null,
  selectedYear: null,
  course: null,
  expandAdvancedOptions: false,
  startDate: null,
  skipOfferings: false,
  title: null,
  isSaving: false,
  selectedCohorts: null,

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.get('save').perform();
    }
  },

  save: task(function * (){
    this.set('isSaving', true);
    yield timeout(10);
    this.send('addErrorDisplaysFor', ['title', 'selectedYear']);
    let {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      this.set('isSaving', false);
      return;
    }
    const commonAjax = this.get('commonAjax');
    const courseId = this.get('course.id');
    const expandAdvancedOptions = this.get('expandAdvancedOptions');
    const year = this.get('selectedYear');
    const newCourseTitle = this.get('title');
    const selectedCohortIds = this.get('selectedCohorts').mapBy('id');
    let newStartDate = moment(this.get('startDate')).format('YYYY-MM-DD');
    let skipOfferings = this.get('skipOfferings');

    let data = {
      year,
      newCourseTitle
    };
    if (expandAdvancedOptions && newStartDate) {
      data.newStartDate = newStartDate;
    }
    if (expandAdvancedOptions && skipOfferings) {
      data.skipOfferings = true;
    }
    if (selectedCohortIds) {
      data.newCohorts = selectedCohortIds;
    }
    const host = this.get('host') ? this.get('host') : '';
    const namespace = this.get('namespace');

    let url = host + '/' + namespace + `/courses/${courseId}/rollover`;
    const newCoursesObj = yield commonAjax.request(url, {
      method: 'POST',
      data
    });

    const flashMessages = this.get('flashMessages');
    const store = this.get('store');
    flashMessages.success('general.courseRolloverSuccess');
    store.pushPayload(newCoursesObj);
    let newCourse = store.peekRecord('course', newCoursesObj.courses[0].id);

    return this.get('visit')(newCourse);
  }).drop(),

  loadUnavailableYears: task(function * (){
    yield timeout(250); //debounce title changes
    const title = this.get('title');
    const store = this.get('store');
    let existingCoursesWithTitle = yield store.query('course', {
      filters: {title}
    });

    return existingCoursesWithTitle.mapBy('year');
  }).restartable(),

  changeSelectedYear: task(function * (selectedYear){
    this.setProperties({selectedYear});
    yield timeout(100); //let max/min cp's recalculate

    const date = moment(this.get('course.startDate'));
    const day = date.isoWeekday();
    const week = date.isoWeek();

    let startDate = moment().year(selectedYear).isoWeek(week).isoWeekday(day).toDate();
    this.setProperties({startDate});
  }).restartable(),

  /**
   * "disableDayFn" callback function pikaday.
   * @link https://github.com/dbushell/Pikaday#configuration
   * @param {Date} date
   * @returns {boolean}
   */
  disableDayFn(date) {
    // KLUDGE!
    // We're sneaking the course into pikaday via the options hash.
    // See https://github.com/edgycircle/ember-pikaday#using-pikaday-specific-options
    // If ember-pikaday ever locks down this backdoor, then we're hosed.
    // @todo Find a better way. [ST 2016/06/30]
    if (this.course) {
      // ensure that only dates that fall on the same weekday as the course's start date can be selected.
      return this.course.get('startDate').getUTCDay() !== date.getUTCDay();
    }
    return false; // don't disable anything if we don't have a course to compare to.
  },

  actions: {
    changeTitle(newTitle){
      this.set('title', newTitle);
      this.get('loadUnavailableYears').perform();
    },
    addCohort(cohort) {
      let selectedCohorts = this.get('selectedCohorts');
      selectedCohorts.pushObject(cohort);
      this.set('selectedCohorts', selectedCohorts);
    },
    removeCohort(cohort){
      let selectedCohorts = this.get('selectedCohorts');
      selectedCohorts.removeObject(cohort);
      this.set('selectedCohorts', selectedCohorts);
    },
  }
});
