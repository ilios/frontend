import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import moment from 'moment';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

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
  currentSchool: [
    validator('presence', true)
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);

    //build a list of years to seelct from
    let thisYear = parseInt(moment().format('YYYY'));
    let years = [
      thisYear-2,
      thisYear-1,
      thisYear,
      thisYear+1,
      thisYear+2
    ];

    this.set('years', years);

    const currentYear = this.get('currentYear');
    if (isPresent(currentYear) && years.includes(parseInt(currentYear.get('title')))) {
      this.set('selectedYear', currentYear.get('title'));
    } else {
      this.set('selectedYear', thisYear);
    }
  },
  tagName: 'section',
  classNames: ['new-course', 'new-result', 'form-container'],

  i18n: service(),
  store: service(),

  years: null,

  currentYear: null,
  currentSchool: null,
  title: null,
  selectedYear: null,
  isSaving: false,

  actions: {
    setYear(year) {
      this.set('selectedYear', year);
    },
    save() {
      this.set('isSaving', true);
      this.send('addErrorDisplayFor', 'title');
      this.validate().then(({validations}) => {
        if (validations.get('isValid')) {
          this.send('removeErrorDisplayFor', 'title');
          let course = this.get('store').createRecord('course', {
            title: this.get('title'),
            school: this.get('currentSchool'),
            year: this.get('selectedYear'),
            level: 1,
          });
          this.get('save')(course);
        } else {
          this.set('isSaving', false);
        }
      });
    },

    cancel() {
      this.sendAction('cancel', this.get('course'));
    },

    changeValue(value) {
      this.set('title', value);
    }
  }
});
