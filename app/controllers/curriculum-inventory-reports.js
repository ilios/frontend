import Ember from 'ember';
import DS from 'ember-data';

const { computed, Controller, RSVP, isEmpty, isPresent, inject } = Ember;
const { gt, oneWay, sort } = computed;
const { service } = inject;
const { PromiseArray, PromiseObject } = DS;

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
  sortedPrograms: sort('programs', 'sortByTitle'),
  hasMoreThanOneProgram: gt('programs.length', 1),

  showNewCurriculumInventoryForm: false,

  programs: computed('selectedSchool', function(){
    let defer = RSVP.defer();
    this.get('selectedSchool').then(school => {
      if(isEmpty(school)){
        defer.resolve([]);
      } else {
        this.get('store').query('program', {
          filters: {
            school: school.get('id'),
            published: true
          }
        }).then(programs => {
          defer.resolve(programs);
        });
      }
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  selectedSchool: computed('schools.[]', 'schoolId', function(){
    let schools = this.get('schools');
    if(isPresent(this.get('schoolId'))){
      let school =  schools.find(school => {
        return school.get('id') === this.get('schoolId');
      });
      if(school){
        return PromiseObject.create({
          promise: RSVP.resolve(school)
        });
      }
    }
    return PromiseObject.create({
      promise: this.get('currentUser').get('model').then(user => {
        return user.get('school').then(school => {
          return school;
        });
      })
    });
  }),

  selectedProgram: computed('programs.[]', 'programId', function(){
    let defer = RSVP.defer();
    this.get('programs').then(programs => {
      let program;
      if(isPresent(this.get('programId'))){
        program =  programs.find(program => {
          return program.get('id') === this.get('programId');
        });

      }
      if(program){
        defer.resolve(program);
      } else {
        if(programs.length > 1){
          defer.resolve(null);
        } else {
          defer.resolve(programs.sortBy('title').get('firstObject'));
        }
      }
    });

    return PromiseObject.create({
      promise: defer.promise
    });
  }),

  reportsAndNewReports: computed('reports.[]', 'newReports.[]', function(){
    let defer = RSVP.defer();
    this.get('reports').then(reports => {
      let all = [];
      all.pushObjects(reports.toArray());
      const selectedProgram = this.get('selectedProgram');
      if (isPresent(selectedProgram)) {
        let newReports = this.get('newReports').filter(report => {
          return report.get('program').get('id') === selectedProgram.get('id') && !all.contains(report);
        });
        all.pushObjects(newReports.toArray());
      }
      defer.resolve(all);
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  reports: computed('selectedProgram', function(){
    let defer = RSVP.defer();
    const selectedSchool = this.get('selectedSchool');
    this.get('selectedSchool').then(selectedSchool => {
      this.get('selectedProgram').then(selectedProgram => {
        if(isEmpty(selectedSchool) || isEmpty(selectedProgram)){
          defer.resolve([]);
        } else {
          this.get('store').query('curriculum-inventory-report', {
            filters: {
              program: selectedProgram.get('id')
            },
            limit: 500
          }).then(reports => {
            defer.resolve(reports);
          });
        }
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),

  actions: {
    changeSelectedProgram(programId) {
      let program = this.get('programs').findBy('id', programId);
      program.get('school').then(school => {
        this.set('schoolId', school.get('id'));
        this.set('programId', programId);
        this.set('showNewCurriculumInventoryReportForm', false);
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
