import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt, oneWay, sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';

export default Controller.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),

  queryParams: {
    programId: 'program',
    schoolId: 'school',
    sortReportsBy: 'sortBy'
  },

  newReport: null,
  programId: null,
  schoolId: null,
  showNewCurriculumInventoryForm: false,
  sortByTitle: null,
  sortReportsBy: 'name',

  hasMoreThanOneSchool: gt('model.length', 1),
  schools: oneWay('model'),
  sortedSchools: sort('model', 'sortByTitle'),

  /**
   * The currently selected school. Defaults to the current-user's primary school if none is selected.
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
  selectedSchool: computed('model.[]', 'schoolId', async function() {
    const schools = this.model;
    const schoolId = this.schoolId;

    if (isPresent(schoolId)){
      const school = schools.findBy('id', schoolId);

      if (school) {
        return school;
      }
    } else {
      const user = await this.currentUser.model;
      return await user.school;
    }
  }),

  /**
   * A list of published programs owned by the currently selected school.
   * @property programs
   * @type {Ember.computed}
   * @protected
   */
  programs: computed('selectedSchool', async function() {
    const school = await this.selectedSchool;

    if (isEmpty(school)){
      return [];
    } else {
      const filters = { published: true, school: school.id };
      const programs = await this.store.query('program', { filters });
      return programs.toArray();
    }
  }),

  /**
   * The currently selected program.
   * Defaults to the first available program for the currently selected school if none is selected.
   * @property selectedProgram
   * @type {Ember.computed}
   * @public
   */
  selectedProgram: computed('programs.[]', 'programId', async function() {
    const programs = await this.programs;
    const programId = this.programId;
    let program;

    if (isPresent(programId)) {
      program = programs.findBy('id', programId);
    }

    if (program) {
      return program;
    } else {
      return programs.length ? programs.sortBy('title').firstObject : null;
    }
  }),

  canCreate: computed('selectedSchool', async function () {
    const permissionChecker = this.permissionChecker;
    const selectedSchool = await this.selectedSchool;
    return permissionChecker.canCreateCurriculumInventoryReport(selectedSchool);
  }),

  actions: {
    changeSelectedProgram(programId) {
      this.programs.then(programs => {
        let program = programs.findBy('id', programId);
        program.get('school').then(school => {
          this.set('schoolId', school.get('id'));
          this.set('programId', programId);
          this.set('showNewCurriculumInventoryReportForm', false);
        });
      });
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
      this.set('programId', null);
      this.set('showNewCurriculumInventoryReportForm', false);
    },

    editCurriculumInventoryReport(report) {
      this.transitionToRoute('curriculumInventoryReport', report);
    },

    removeCurriculumInventoryReport(report) {
      this.selectedProgram.then(program => {
        program.get('curriculumInventoryReports').then(reports => {
          reports.removeObject(report);
          report.destroyRecord();
        });
      });
    },

    toggleNewCurriculumInventoryReportForm() {
      this.set('showNewCurriculumInventoryReportForm', !this.showNewCurriculumInventoryReportForm);
    },

    async saveNewCurriculumInventoryReport(newReport) {
      const savedReport = await newReport.save();
      this.set('newReport', savedReport);
      const program = await this.selectedProgram;
      const reports = await program.curriculumInventoryReports;
      reports.pushObject(savedReport);
      this.set('showNewCurriculumInventoryReportForm', false);
    },

    cancel() {
      this.set('showNewCurriculumInventoryReportForm', false);
    }
  }
});
