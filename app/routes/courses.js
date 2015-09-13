import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  i18n: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  model: function(params) {
    var self = this;
    var defer = Ember.RSVP.defer();

    Ember.run.later(defer.resolve, function() {
      var resolve = this;
      self.get('currentUser.model').then(function(currentUser){
        var schoolId = params.schoolId == null ? currentUser.get('school.id') : params.schoolId;
        self.store.find('school', schoolId).then(function(school){
          self.store.find('academic-year').then(function(years){
            var year = null;
            if(params.yearTitle != null){
              year = years.find(function(year){
                return parseInt(year.get('title')) === parseInt(params.yearTitle);
              });
            }
            if(year == null){
              year = years.sortBy('title').get('lastObject');
            }
            self.store.query('course', {
              filters: {
                school: school.get('id'),
                year: year.get('title'),
                deleted: false
              },
              limit: 500
            }).then(function(courses){
              currentUser.get('schools').then(function(schools){
                resolve({
                  school: school,
                  schools: schools,
                  year: year,
                  years: years.sortBy('title'),
                  courses: courses
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
        controller.set('model', hash.courses);
        controller.set('schools', hash.schools);
        controller.set('selectedSchool', hash.school);
        controller.set('selectedYear', hash.year);
        controller.set('years', hash.years);
        self.controllerFor('application').set('pageTitleTranslation', 'navigation.courses');
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
    year: {
      refreshModel: true
    }
  }
});
