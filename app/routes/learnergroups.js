import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var self = this;
    var defer = Ember.RSVP.defer();

    Ember.run.later(defer.resolve, function() {
      var resolve = this;
      var schoolId = params.schoolId == null ? self.get('currentUser.primarySchool.id') : params.schoolId;
      self.store.find('school', schoolId).then(function(school){
        school.get('cohorts').then(function(cohorts){
          var cohort = null;
          if(params.cohortId != null){
            cohort = cohorts.filterBy('id', params.cohortId).get('firstObject');
          }
          if(cohort == null){
            cohort = cohorts.sortBy('displayTitle').get('firstObject');
          }
          var cohortId = parseInt(cohort.get('id'));
          self.store.find('learner-group', {
            filters: {
              parent: 'null',
              cohort: cohortId
            },
            limit: 500
          }).then(function(learnerGroups){
            self.get('currentUser.schools').then(function(schools){
              resolve({
                school: school,
                schools: schools,
                cohort: cohort,
                cohorts: cohorts,
                learnerGroups: learnerGroups
              });
            });
          });
        });
      });
    }, 500);

    return defer.promise;
  },
  setupController: function(controller, hash){
    controller.set('schoolId', parseInt(hash.school.get('id')));
    controller.set('schools', hash.schools);
    controller.set('cohortId', parseInt(hash.cohort.get('id')));
    controller.set('selectedSchool', hash.school);
    controller.set('selectedCohort', hash.cohort);
    controller.set('cohorts', hash.cohorts);
    controller.set('content', hash.learnerGroups);
    this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.learnerGroups'));
  },
  queryParams: {
    filter: {
      replace: true
    },
    school: {
      refreshModel: true
    },
    cohort: {
      refreshModel: true
    }
  }
});
