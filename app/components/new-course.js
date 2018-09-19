/* eslint ember/order-in-components: 0 */
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
    let thisYear = parseInt(moment().format('YYYY'), 10);
    let years = [
      thisYear-2,
      thisYear-1,
      thisYear,
      thisYear+1,
      thisYear+2
    ];

    this.set('years', years);

    const currentYear = this.currentYear;
    if (isPresent(currentYear) && years.includes(parseInt(currentYear.get('title'), 10))) {
      this.set('selectedYear', currentYear.get('title'));
    } else {
      this.set('selectedYear', thisYear);
    }
  },
  classNames: ['new-course'],

  i18n: service(),
  store: service(),

  years: null,

  currentYear: null,
  currentSchool: null,
  title: null,
  selectedYear: null,
  isSaving: false,

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

    if(27 === keyCode) {
      this.sendAction('cancel');
    }
  },

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
          let course = this.store.createRecord('course', {
            title: this.title,
            school: this.currentSchool,
            year: this.selectedYear,
            level: 1,
          });
          this.save(course);
        } else {
          this.set('isSaving', false);
        }
      });
    },

    cancel() {
      this.sendAction('cancel', this.course);
    },

    changeValue(value) {
      this.set('title', value);
    }
  }
});
