import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  currentUser: Ember.inject.service(),
  model: function(params) {
    var self = this;
    var defer = Ember.RSVP.defer();

    Ember.run.later(defer.resolve, function() {
      var resolve = this;
      self.get('currentUser.model').then(function(currentUser){
        var schoolId = params.schoolId == null ? currentUser.get('primarySchool.id') : params.schoolId;
        self.store.find('school', schoolId).then(function(school){
          self.store.find('program', {
            filters: {
              owningSchool: school.get('id'),
              deleted: false
            },
            limit: 500
          }).then(function(programs){
            currentUser.get('schools').then(function(schools){
              resolve({
                school: school,
                schools: schools,
                programs: programs
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
        controller.set('model', hash.programs);
        controller.set('schools', hash.schools);
        controller.set('selectedSchool', hash.school);
        self.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.programs'));
      }
    });
  },
  queryParams: {
    filter: {
      replace: true
    },
    school: {
      refreshModel: true
    }
  }
});
