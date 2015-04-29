import Ember from 'ember';

export default Ember.Route.extend({
  currentUser: Ember.inject.service(),
  model: function(params) {
    var self = this;
    var defer = Ember.RSVP.defer();

    Ember.run.later(defer.resolve, function() {
      var resolve = this;
      self.get('currentUser.model').then(function(currentUser){
        var schoolId = params.schoolId == null ? currentUser.get('primarySchool.id') : params.schoolId;
        currentUser.get('schools').then(function(schools){
          self.store.find('school', schoolId).then(function(school){
            school.get('programs').then(function(programs){
              if(programs.length === 0){
                resolve({
                  school: school,
                  schools: schools,
                  program: null,
                  programs: [],
                  programYear: null,
                  programYears: [],
                  cohort: null,
                  learnerGroups: []
                });
                return;
              }
              var program = null;
              if(params.programId != null){
                program = programs.find(function(program){
                  return parseInt(program.get('id')) === parseInt(params.programId);
                });
              }
              if(program == null){
                program = programs.sortBy('id').get('lastObject');
              }
              program.get('programYears').then(function(programYears){
                if(programYears.length === 0){
                  resolve({
                    school: school,
                    schools: schools,
                    program: program,
                    programs: programs,
                    programYear: null,
                    programYears: [],
                    cohort: null,
                    learnerGroups: []
                  });
                  return;
                }
                var programYear = null;
                if(params.programYearId != null){
                  programYear = programYears.find(function(programYear){
                    return parseInt(programYear.get('id')) === parseInt(params.programYearId);
                  });
                }
                if(programYear == null){
                  programYear = programYears.sortBy('id').get('lastObject');
                }
                programYear.get('cohort').then(function(cohort){
                  cohort.get('learnerGroups').then(function(learnerGroups){
                    resolve({
                      school: school,
                      schools: schools,
                      program: program,
                      programs: programs.sortBy('title'),
                      programYear: programYear,
                      programYears: programYears.sortBy('title'),
                      cohort: cohort,
                      learnerGroups: learnerGroups
                    });
                  });
                });
              });
            });
          });
        });
      });
    }, 500);

    return defer.promise;
  },
  setupController: function(controller, hash){
    var self = this;
    Ember.run.later(function(){
      if(!controller.get('isDestroyed')){
        controller.set('model', hash.learnerGroups);
        controller.set('schools', hash.schools);
        controller.set('selectedSchool', hash.school);
        controller.set('programs', hash.programs);
        controller.set('selectedProgram', hash.program);
        controller.set('programYears', hash.programYears);
        controller.set('selectedProgramYear', hash.programYear);
        self.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.learnerGroups'));
      }
    });
  },
  queryParams: {
    filter: {
      replace: true
    },
    school: {
      refreshModel: true
    },
    program: {
      refreshModel: true
    },
    programYear: {
      refreshModel: true
    }
  }
});
