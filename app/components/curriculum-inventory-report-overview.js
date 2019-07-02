import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import scrollTo from 'ilios-common/utils/scroll-to';

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
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  currentUser: service(),
  permissionChecker: service(),
  router: service(),
  routing: service('-routing'),

  classNames: ['curriculum-inventory-report-overview'],
  tagName: 'section',

  canUpdate: false,
  currentRoute: '',
  description: null,
  endDate: null,
  report: null,
  startDate: null,
  year: null,
  yearOptions: null,

  yearLabel: computed('year', function() {
    const year = this.year;
    return year + ' - ' + (parseInt(year, 10) + 1);
  }),

  showRollover: computed('report.program', 'currentUser', 'routing.currentRouteName', async function() {
    const routing = this.routing;
    if (routing.get('currentRouteName') === 'curriculumInventoryReport.rollover') {
      return false;
    }
    const permissionChecker = this.permissionChecker;
    const report = this.report;
    const program = await report.get('program');
    const school = await program.get('school');
    return await permissionChecker.canCreateCurriculumInventoryReport(school);
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    const report = this.report;
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

  actions: {
    async changeStartDate() {
      const { report, startDate } = this.getProperties('report', 'startDate');
      this.send('addErrorDisplayFor', 'startDate');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'startDate');
        report.set('startDate', startDate);
        const newCourse = await report.save();
        this.set('startDate', newCourse.startDate);
        this.set('report', newCourse);
      } else {
        await reject();
      }
    },

    revertStartDateChanges() {
      const report = this.report;
      this.set('startDate', report.get('startDate'));
    },

    async changeEndDate() {
      const { endDate, report } = this.getProperties('endDate', 'report');
      this.send('addErrorDisplayFor', 'endDate');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'endDate');
        report.set('endDate', endDate);
        const newCourse = await report.save();
        this.set('endDate', newCourse.endDate);
        this.set('report', newCourse);
      } else {
        await reject();
      }
    },

    revertEndDateChanges() {
      const report = this.report;
      this.set('endDate', report.get('endDate'));
    },

    changeYear() {
      let report = this.report;
      let year = this.year;
      report.set('year', year);
      report.save();
    },

    revertYearChanges(){
      this.set('year', this.report.get('year'));
    },

    async changeDescription() {
      const newDescription = this.description;
      const report = this.report;
      this.send('addErrorDisplayFor', 'description');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'description');
        report.set('description', newDescription);
        const newReport = await report.save();
        this.set('description', newReport.description);
        this.set('report', newReport);
      } else {
        await reject();
      }
    },

    revertDescriptionChanges(){
      const report = this.report;
      this.set('description', report.get('description'));
    },

    transitionToRollover() {
      this.router.transitionTo('curriculumInventoryReport.rollover', this.report);
      scrollTo('.rollover-form');
    }
  }
});
