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

  newReports: [],
  newestReport: computed('newReports.[]', function(){
    const reports = this.get('newReports');
    if (reports.length) {
      return reports[reports.length - 1];
    }
    return false;
  }),
  sortedSchools: sort('schools', 'sortByTitle'),
  hasMoreThanOneSchool: gt('schools.length', 1),

  showNewCurriculumInventoryForm: false,

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
   * The currently selected school. Defaults to the current-user's primary school if none is selected.
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
  selectedSchool: computed('schools.[]', 'schoolId', function(){
    return new Promise(resolve => {
      let schools = this.get('schools');
      if(isPresent(this.get('schoolId'))){
        let school =  schools.find(school => {
          return school.get('id') === this.get('schoolId');
        });
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
          program = programs.find(program => {
            return program.get('id') === this.get('programId');
          });
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

  /**
   * A list of all available reports, including newly added ones.
   * @property reportAndNewReports
   * @type {Ember.computed}
   * @public
   */
  reportsAndNewReports: computed('reports.[]', 'newReports.[]', function(){
    return new Promise(resolve => {
      this.get('reports').then(reports => {
        let all = [];
        all.pushObjects(reports);
        this.get('selectedProgram').then(selectedProgram => {
          if (isPresent(selectedProgram)) {
            let newReports = this.get('newReports').filter(report => {
              return report.get('program').get('id') === selectedProgram.get('id') && !all.includes(report);
            });
            all.pushObjects(newReports.toArray());
          }
          resolve(all);
        });
      });
    });
  }),

  /**
   * A list of all reports for the currently selected program.
   * @property reports
   * @type {Ember.computed}
   * @public
   */
  reports: computed('selectedProgram', 'selectedSchool', function(){
    return new Promise(resolve => {
      this.get('selectedSchool').then(selectedSchool => {
        this.get('selectedProgram').then(selectedProgram => {
          if(isEmpty(selectedSchool) || isEmpty(selectedProgram)){
            resolve([]);
          } else {
            this.get('store').query('curriculum-inventory-report', {
              filters: {
                program: selectedProgram.get('id')
              },
              limit: 500
            }).then(reports => {
              resolve(reports.toArray());
            });
          }
        });
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

    changeSelectedSchool: function(schoolId){
      this.set('schoolId', schoolId);
      this.set('programId', null);
      this.set('showNewCurriculumInventoryReportForm', false);
    },

    editCurriculumInventoryReport(report) {
      this.transitionToRoute('curriculumInventoryReport', report);
    },

    removeCurriculumInventoryReport(report) {
      let newReports = this.get('newReports');
      if (newReports.includes(report)) {
        newReports.removeObject(report);
      }
      return report.destroyRecord();
    },

    toggleNewCurriculumInventoryReportForm() {
      this.set('showNewCurriculumInventoryReportForm', !this.get('showNewCurriculumInventoryReportForm'));
    },

    saveNewCurriculumInventoryReport(newReport) {
      return newReport.save().then(savedReport => {
        this.get('newReports').pushObject(savedReport);
        this.set('showNewCurriculumInventoryReportForm', false);
      });
    },

    cancel() {
      this.set('showNewCurriculumInventoryReportForm', false);
    },
  }
});
