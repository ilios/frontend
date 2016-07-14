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
    this.set('description', this.get('report.description'));
  },


  classNames: ['curriculum-inventory-report-overview'],
  tagName: 'section',
  description: null,
  report: null,
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
      const program = this.get('report');
      this.set('report', program.get('description'));
    },
  }
});
