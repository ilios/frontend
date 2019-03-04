/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { task } from 'ember-concurrency';

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
  flashMessages: service(),
  ajax: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('reportName', this.get('report.name'));
  },
  classNames: ['curriculum-inventory-report-header'],
  report: null,
  reportName: null,
  publishTarget: alias('report'),
  canUpdate: false,
  isDownloading: false,

  downloadReport: task(function * (report) {
    this.set('isDownloading', true);
    const { saveAs } = yield import('file-saver');
    const content = yield this.ajax.request(report.absoluteFileUri, {
      method: 'GET',
      dataType: 'arraybuffer',
      processData: false
    });
    saveAs(new Blob([ content ], { type: 'application/xml' }), 'report.xml');
    this.set('isDownloading', false);
  }).drop(),

  actions: {
    changeName(){
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

    revertNameChanges(){
      const report = this.report;
      this.set('reportName', report.get('name'));
    },

    finalize() {
      this.finalize();
    }
  }
});
