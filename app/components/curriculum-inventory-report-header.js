/* eslint ember/order-in-components: 0 */
import Ember from 'ember';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task, timeout } from 'ember-concurrency';

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
  cookies: service(),

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('reportName', this.get('report.name'));

    // check if the d/l link points at the same domain as the current page is on.
    let parser = document.createElement('a');
    parser.href = this.get('report.absoluteFileUri');
    let backendDomain = parser.hostname;
    let frontendDomain = window.location.hostname;
    this.set('downloadFromSameDomain', (backendDomain === frontendDomain));
  },
  classNames: ['curriculum-inventory-report-header'],
  report: null,
  reportName: null,
  publishTarget: alias('report'),
  canUpdate: false,
  isDownloading: false,
  downloadFromSameDomain: false,

  downloadReport: task(function* (report) {
    const cookies = this.get('cookies');
    let anchor = document.createElement('a');
    anchor.href = report.get('absoluteFileUri');
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.download = 'report.xml';
    anchor.click();
    if (this.get('downloadFromSameDomain')) {
      this.set('isDownloading', true);
      let downloadHasStarted = false;
      if (!Ember.testing) {
        let cookieName = 'report-download-' + report.get('id');
        while (!downloadHasStarted) {
          yield timeout(1000);
          if (cookies.exists(cookieName)) {
            downloadHasStarted = true;
            cookies.clear(cookieName);
          }
        }
      }
      this.set('isDownloading', false);
    } else {
      this.get('flashMessages').success('general.downloadingCurriculumInventoryReport');
      yield timeout(1000);
    }
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
