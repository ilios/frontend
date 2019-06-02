import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const Validations = buildValidations({
  currentSchool: validator('presence', true),
  selectedYear: validator('presence', true),
  title: [
    validator('presence', true),
    validator('length', { min: 3, max: 200 })
  ]
});

const THIS_YEAR = parseInt(moment().format('YYYY'), 10);
const YEARS = [
  THIS_YEAR-2,
  THIS_YEAR-1,
  THIS_YEAR,
  THIS_YEAR+1,
  THIS_YEAR+2
];

export default Component.extend(Validations, ValidationErrorDisplay, {
  intl: service(),
  store: service(),

  classNames: ['new-course'],

  currentSchool: null,
  currentYear: null,
  selectedYear: null,
  title: null,
  cancel() {},
  save() {},
  years: Object.freeze(YEARS),

  isSaving: reads('saveCourse.isRunning'),

  actions: {
    setYear(year) {
      this.set('selectedYear', parseInt(year, 10));
    }
  },

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }
    if (13 === keyCode) {
      this.send('save');
      return;
    }
    if (27 === keyCode) {
      this.cancel();
    }
  },

  saveCourse: task(function* () {
    this.send('addErrorDisplayFor', 'title');
    const { validations } = yield this.validate();

    if (validations.get('isValid')) {
      this.send('removeErrorDisplayFor', 'title');
      const course = this.store.createRecord('course', {
        level: 1,
        title: this.title,
        school: this.currentSchool,
        year: this.selectedYear
      });
      this.save(course);
    }
  })
});
