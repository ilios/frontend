import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task } from 'ember-concurrency';
import fetch from 'fetch';

const Validations = buildValidations({
  reportName: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  ajax: service(),
  flashMessages: service(),

  classNames: ['curriculum-inventory-report-header'],

  canUpdate: false,
  isDownloading: false,
  report: null,
  reportName: null,

  publishTarget: alias('report'),

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('reportName', this.get('report.name'));
  },

  actions: {
    changeName() {
      const report = this.report;
      const newName = this.reportName;
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

    revertNameChanges() {
      const report = this.report;
      this.set('reportName', report.get('name'));
    },

    finalize() {
      this.finalize();
    }
  },

  downloadReport: task(function* (report) {
    this.set('isDownloading', true);
    const { saveAs } = yield import('file-saver');
    const response = yield fetch(report.absoluteFileUri);
    const blob = yield response.blob();
    saveAs(blob, 'report.xml');
    this.set('isDownloading', false);
  }).drop()
});
