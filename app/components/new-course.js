import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, inject } = Ember;
const { service } = inject;

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
    this.set('selectedYear', this.get('currentYear'));
  },
  tagName: 'section',
  classNames: ['new-course', 'new-result', 'form-container'],

  i18n: service(),
  store: service(),

  years: [],

  currentYear: null,
  currentSchool: null,
  title: null,
  selectedYear: null,
  isSaving: false,

  actions: {
    setYear(yearTitle) {
      let selectedYear = this.get('years').find((year) => {
        return year.get('title') === parseInt(yearTitle);
      });

      this.set('selectedYear', selectedYear);
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
            year: this.get('selectedYear').get('title'),
            level: 1,
          });

          this.get('save')(course).finally(() =>{
            this.set('isSaving', true);
          });
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
