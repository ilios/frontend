import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";
import ValidationError from 'ilios/mixins/validation-error';
import EmberValidations from 'ember-validations';

const { Component, inject, isEmpty, computed, isPresent } = Ember;
const { service } = inject;
const { alias } = computed;

export default Component.extend(ValidationError, EmberValidations, {
  tagName: 'section',
  classNames: ['new-course', 'new-result', 'form-container'],

  i18n: service(),
  store: service(),

  placeholder: t('courses.courseTitlePlaceholder'),

  years: [],

  currentYear: null,
  currentSchool: null,
  title: null,
  selectedYear: null,

  bestSelectedYear: computed('selectedYear', 'currentYear', function() {
    const selectedYear = this.get('selectedYear');
    const currentYear = this.get('currentYear');

    if (isPresent(selectedYear)) {
      return selectedYear;
    }

    return currentYear;
  }),

  validationBuffer: alias('title'),
  validations: {
    'validationBuffer': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    }
  },

  actions: {
    setYear(yearTitle) {
      let selectedYear = this.get('years').find((year) => {
        return year.get('title') === parseInt(yearTitle);
      });

      this.set('selectedYear', selectedYear);
    },

    save() {
      this.validate()
        .then(() => {
          let year = this.get('selectedYear') || this.get('currentYear');

          if (isEmpty(year)) {
            throw new Error("Tried to save a course with no year context");
          }

          let course = this.get('store').createRecord('course', {
            title: this.get('title'),
            school: this.get('currentSchool'),
            year: year.get('title'),
            level: 1,
          });

          this.sendAction('save', course);
        })
        .catch(() => {
          return;
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
