/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import EmberObject, { computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { alias, filterBy, reads, sort } = computed;
const { Promise } = RSVP;

const Validations = buildValidations({
  description: [
    validator('length', {
      min: 0,
      max: 21844,
      allowBlank: true
    }),
  ],
  startDate: [
    validator('date', {
      dependentKeys: ['model.endDate'],
      onOrBefore: reads('model.endDate'),
    }),
  ],
  endDate: [
    validator('date', {
      dependentKeys: ['model.startDate'],
      onOrAfter: reads('model.startDate'),
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  currentUser: service(),
  routing: service('-routing'),
  currentRoute: '',
  year: null,

  init(){
    this._super(...arguments);
    this.set('administratorsSort', ['lastName', 'firstName']);
  },

  didReceiveAttrs(){
    this._super(...arguments);

    const report = this.get('report');
    const description = report.get('description');
    const currentYear = new Date().getFullYear();
    const year = report.get('year');
    const yearLabel = report.get('yearLabel');
    const startDate = report.get('startDate');
    const endDate = report.get('endDate');

    let yearOptions = [];
    yearOptions.pushObject(EmberObject.create({'id': year, 'title': yearLabel}));
    for (let i = currentYear - 5, n = currentYear + 5; i <= n; i++) {
      if (i != year) {
        yearOptions.pushObject(EmberObject.create({'id': i, 'title': i + ' - ' + (i + 1)}));
      }
    }

    yearOptions = yearOptions.uniq().sortBy('title');

    this.setProperties({
      description,
      yearOptions,
      startDate,
      endDate,
      year
    });
  },

  yearLabel: computed('year', function() {
    const year = this.get('year');
    return year + ' - ' + (parseInt(year, 10) + 1);
  }),

  showRollover: computed('currentUser', 'routing.currentRouteName', function(){
    return new Promise(resolve => {
      const routing = this.get('routing');
      if (routing.get('currentRouteName') === 'curriculumInventoryReport.rollover') {
        resolve(false);
      } else {
        const currentUser = this.get('currentUser');
        currentUser.get('userIsDeveloper').then(hasRole => {
          resolve(hasRole);
        });
      }
    });
  }),

  classNames: ['curriculum-inventory-report-overview'],
  tagName: 'section',
  description: null,
  report: null,
  startDate: null,
  endDate: null,
  yearOptions: null,
  isFinalized: alias('report.isFinalized'),
  administratorsSort: null,
  administratorsWithFullNames: filterBy('report.administrators', 'fullName'),
  sortedAdministrators: sort('administratorsWithFullNames', 'administratorsSort'),
  actions: {
    changeStartDate(){
      const newDate = this.get('startDate');
      const report = this.get('report');
      this.send('addErrorDisplayFor', 'startDate');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'startDate');
            report.set('startDate', newDate);
            report.save().then((newCourse) => {
              this.set('startDate', newCourse.get('startDate'));
              this.set('report', newCourse);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertStartDateChanges(){
      const report = this.get('report');
      this.set('startDate', report.get('startDate'));
    },
    changeEndDate(){
      const newDate = this.get('endDate');
      const report = this.get('report');
      this.send('addErrorDisplayFor', 'endDate');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'endDate');
            report.set('endDate', newDate);
            report.save().then((newCourse) => {
              this.set('endDate', newCourse.get('endDate'));
              this.set('report', newCourse);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertEndDateChanges(){
      const report = this.get('report');
      this.set('endDate', report.get('endDate'));
    },
    changeYear() {
      let report = this.get('report');
      let year = this.get('year');
      report.set('year', year);
      report.save();
    },
    revertYearChanges(){
      this.set('year', this.get('report').get('year'));
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
    async addAdministrator(user) {
      const report = this.get('report');
      const administrators = await report.get('administrators');
      administrators.addObject(user);
      user.get('administeredCurriculumInventoryReports').addObject(report);
      report.save();
    },
    async removeAdministrator(user) {
      const report = this.get('report');
      const administrators = await report.get('administrators');
      administrators.removeObject(user);
      user.get('administeredCurriculumInventoryReports').removeObject(report);
      report.save();
    },
  }
});
