import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt, oneWay, sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { Promise } from 'rsvp';

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
  selectedSchool: computed('model.[]', 'schoolId', function() {
    return new Promise(resolve => {
      let schools = this.model;
      const schoolId = this.schoolId;
      if(isPresent(schoolId)){
        let school = schools.findBy('id', schoolId);
        if(school){
          resolve(school);
        }
      } else {
        this.currentUser.get('model').then(user => {
          user.get('school').then(school => {
            resolve(school);
          });
        });
      }
    });
  }),

  /**
   * A list of published programs owned by the currently selected school.
   * @property programs
   * @type {Ember.computed}
   * @protected
   */
  programs: computed('selectedSchool', function() {
    return new Promise(resolve => {
      this.selectedSchool.then(school => {
        if(isEmpty(school)){
          resolve([]);
        } else {
          this.store.query('program', {
            filters: {
              school: school.get('id'),
              published: true
            }
          }).then(programs => {
            resolve(programs.toArray());
          });
        }
      });
    });
  }),

  /**
   * The currently selected program.
   * Defaults to the first available program for the currently selected school if none is selected.
   * @property selectedProgram
   * @type {Ember.computed}
   * @public
   */
  selectedProgram: computed('programs.[]', 'programId', function() {
    return new Promise(resolve => {
      this.programs.then(programs => {
        let program;
        let programId = this.programId;
        if(isPresent(programId)){
          program = programs.findBy('id', programId);
        }
        if(program){
          resolve(program);
        } else {
          if(programs.length){
            program = programs.sortBy('title').get('firstObject');
            resolve(program);
          } else {
            resolve(null);
          }
        }
      });
    });
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

    saveNewCurriculumInventoryReport(newReport) {
      return new Promise(resolve => {
        newReport.save().then(savedReport => {
          this.set('newReport', savedReport);
          this.selectedProgram.then(program => {
            program.get('curriculumInventoryReports').then(reports => {
              reports.pushObject(savedReport);
              this.set('showNewCurriculumInventoryReportForm', false);
              resolve(savedReport);
            });
          });
        });
      });
    },

    cancel() {
      this.set('showNewCurriculumInventoryReportForm', false);
    }
  }
});
