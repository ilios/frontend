import Ember from 'ember';

const { computed, Controller, RSVP, isEmpty, isPresent, inject } = Ember;
const { Promise } = RSVP;
const { gt, oneWay, sort } = computed;
const { service } = inject;

export default Controller.extend({
  i18n: service(),
  currentUser: service(),

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
  sortedSchools: sort('schools', 'sortByTitle'),
  hasMoreThanOneSchool: gt('schools.length', 1),

  showNewCurriculumInventoryForm: false,

  /**
   * The currently selected school. Defaults to the current-user's primary school if none is selected.
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
  selectedSchool: computed('schools.[]', 'schoolId', function(){
    return new Promise(resolve => {
      let schools = this.get('schools');
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
