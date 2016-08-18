import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, RSVP, computed } = Ember;
const { alias } = computed;
const { Promise } = RSVP;
const Validations = buildValidations({
  description: [
    validator('length', {
      min: 0,
      max: 21844,
      allowBlank: true
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);

    const report = this.get('report');
    const description = report.get('description');
    const currentYear = new Date().getFullYear();
    const year = report.get('year');
    const yearLabel = report.get('yearLabel');

    let yearOptions = [];
    yearOptions.pushObject(Ember.Object.create({'id': year, 'title': yearLabel}));
    for (let i = currentYear - 5, n = currentYear + 5; i <= n; i++) {
      yearOptions.pushObject(Ember.Object.create({'id': i, 'title': i + ' -  ' + (i + 1)}));
    }
    yearOptions = yearOptions.uniq().sortBy('title');

    this.setProperties({
      description,
      yearOptions,
    });
  },

  classNames: ['curriculum-inventory-report-overview'],
  tagName: 'section',
  description: null,
  report: null,
  yearOptions: [],
  isFinalized: alias('report.isFinalized'),
  actions: {
    changeStartDate: function(newDate){
      this.get('report').set('startDate', newDate);
      this.get('report').save();
    },
    changeEndDate: function(newDate){
      this.get('report').set('endDate', newDate);
      this.get('report').save();
    },
    changeYear(year) {
      this.get('report').set('year', year);
      this.get('report').save();
    },
    changeDescription() {
      const report = this.get('report');
      const newDescription = this.get('description');
      this.send('addErrorDisplayFor', 'description');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'description');
            report.set('description', newDescription);
            report.save().then((newReport) => {
              this.set('description', newReport.get('description'));
              this.set('report', newReport);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertDescriptionChanges(){
      const report = this.get('report');
      this.set('description', report.get('description'));
    },
  }
});
