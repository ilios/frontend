import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var self = this;
    var defer = Ember.RSVP.defer();

    Ember.run.later(defer.resolve, function() {
      var resolve = this;
      var schoolId = params.schoolId == null ? self.get('currentUser.primarySchool.id') : params.schoolId;
      self.get('currentUser.schools').then(function(schools){
        self.store.find('school', schoolId).then(function(school){
          school.get('programs').then(function(programs){
            var program = null;
            if(params.programId != null){
              program = programs.filterBy('id', params.programId).get('firstObject');
            }
            if(program == null){
              program = programs.sortBy('id').get('firstObject');
            }
            program.get('programYears').then(function(programYears){
              Ember.RSVP.all(programYears.mapBy('cohort')).then(function(arr){
                var cohorts = arr.filter(function(item){
                  return item !== null;
                });
                if(cohorts.length === 0){
                  resolve({
                    school: school,
                    schools: schools,
                    cohort: null,
                    cohorts: [],
                    program: program,
                    programs: programs,
                    learnerGroups: []
                  });
                  return;
                }
                var cohort = null;
                if(params.cohortId != null){
                  cohort = cohorts.filterBy('id', params.cohortId).get('firstObject');
                }
                if(cohort == null){
                  cohort = cohorts.sortBy('displayTitle').get('lastObject');
                }
                var cohortId = parseInt(cohort.get('id'));
                self.store.find('learner-group', {
                  filters: {
                    parent: 'null',
                    cohort: cohortId
                  },
                  limit: 500
                }).then(function(learnerGroups){
                  resolve({
                    school: school,
                    schools: schools,
                    cohort: cohort,
                    cohorts: cohorts,
                    program: program,
                    programs: programs,
                    learnerGroups: learnerGroups
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
    controller.set('schools', hash.schools);
    controller.set('selectedSchool', hash.school);
    controller.set('selectedCohort', hash.cohort);
    controller.set('selectedProgram', hash.program);
    controller.set('cohorts', hash.cohorts);
    controller.set('programs', hash.programs);
    controller.set('content', hash.learnerGroups);
    controller.set('schoolId', parseInt(hash.school.get('id')));
    controller.set('cohortId', hash.cohort?parseInt(hash.cohort.get('id')): null);
    controller.set('cohortId', hash.program?parseInt(hash.program.get('id')): null);
    this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.learnerGroups'));
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
    cohort: {
      refreshModel: true
    }
  }
});
