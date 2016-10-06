import Ember from 'ember';
import Cookies from 'ember-cli-js-cookie';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';

const { Component, computed, RSVP } = Ember;
const { alias } = computed;
const { Promise } = RSVP;

const Validations = buildValidations({
  reportName: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('reportName', this.get('report.name'));
    this.set('isFinalized', this.get('report.isFinalized'));
  },
  classNames: ['curriculum-inventory-report-header'],
  report: null,
  reportName: null,
  publishTarget: alias('report'),
  isFinalized: false,
  isDownloading:false,

  downloadReport: task(function * (report){
    let anchor = document.createElement('a');
    anchor.href = report.absoluteFileUri;
    anchor.target = '_blank';
    anchor.download = 'report.xml';
    anchor.click();
    this.set('isDownloading', true);
    let downloadHasStarted = false;
    if (! Ember.testing) {
      let cookieName = 'report-download-' + report.get('id');
      while (! downloadHasStarted) {
        yield timeout(1000);
        if (Cookies.get(cookieName)) {
          downloadHasStarted = true;
          Cookies.remove(cookieName);
        }
      }
    }
    this.set('isDownloading', false);
  }).drop(),

  actions: {
    changeName(){
      const report = this.get('report');
      const newName = this.get('reportName');
      this.send('addErrorDisplayFor', 'reportName');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'reportName');
            report.set('name', newName);
            report.save().then((newReport) => {
              this.set('reportName', newReport.get('name'));
              this.set('report', newReport);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },

    revertNameChanges(){
      const report = this.get('report');
      this.set('reportName', report.get('name'));
    },

    finalize() {
      this.sendAction('finalize');
    }
  }
});
