/* eslint ember/order-in-controllers: 0 */
/* eslint ember/avoid-leaking-state-in-ember-objects: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import RSVP from 'rsvp';
import { isPresent, isEmpty } from '@ember/utils';
const { Promise } = RSVP;
const { gt, oneWay, sort } = computed;

export default Controller.extend({
  intl: service(),
  currentUser: service(),
  permissionChecker: service(),

  queryParams: {
    schoolId: 'school',
    programId: 'program',
    sortReportsBy: 'sortBy',
  },

  schools: oneWay('model'),
  programId: null,
  schoolId: null,
  sortReportsBy: 'name',
  sortByTitle:['title'],
  newReport: null,
  sortedSchools: sort('model', 'sortByTitle'),
  hasMoreThanOneSchool: gt('model.length', 1),
  showNewCurriculumInventoryForm: false,

  /**
   * The currently selected school. Defaults to the current-user's primary school if none is selected.
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
  selectedSchool: computed('model.[]', 'schoolId', function(){
    return new Promise(resolve => {
      let schools = this.get('model');
      const schoolId = this.get('schoolId');
      if(isPresent(schoolId)){
        let school = schools.findBy('id', schoolId);
        if(school){
          resolve(school);
        }
      } else {
        this.get('currentUser').get('model').then(user => {
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
  programs: computed('selectedSchool', function(){
    return new Promise(resolve => {
      this.get('selectedSchool').then(school => {
        if(isEmpty(school)){
          resolve([]);
        } else {
          this.get('store').query('program', {
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
  selectedProgram: computed('programs.[]', 'programId', function(){
    return new Promise(resolve => {
      this.get('programs').then(programs => {
        let program;
        let programId = this.get('programId');
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
    const permissionChecker = this.get('permissionChecker');
    const selectedSchool = await this.get('selectedSchool');
    return permissionChecker.canCreateCurriculumInventoryReport(selectedSchool);
  }),

  actions: {
    changeSelectedProgram(programId) {
      this.get('programs').then(programs => {
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
      this.get('selectedProgram').then(program => {
        program.get('curriculumInventoryReports').then(reports => {
          reports.removeObject(report);
          report.destroyRecord();
        });
      });
    },

    toggleNewCurriculumInventoryReportForm() {
      this.set('showNewCurriculumInventoryReportForm', !this.get('showNewCurriculumInventoryReportForm'));
    },

    saveNewCurriculumInventoryReport(newReport) {
      return new Promise(resolve => {
        newReport.save().then(savedReport => {
          this.set('newReport', savedReport);
          this.get('selectedProgram').then(program => {
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
    },
  }
});
