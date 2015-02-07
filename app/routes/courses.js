import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var self = this;
    var defer = Ember.RSVP.defer();

    Ember.run.later(defer.resolve, function() {
      var resolve = this;
      var schoolId = params.schoolId == null ? self.get('currentUser.primarySchool.id') : params.schoolId;
      self.store.find('school', schoolId).then(function(school){
        self.store.find('educational-year').then(function(years){
          var year = null;
          if(params.yearTitle != null){
            year = years.filterBy('title', params.yearTitle).get('firstObject');
          }
          if(year == null){
            year = years.sortBy('title').get('lastObject');
          }
          self.store.find('course', {
            filters: {
              owningSchool: school.get('id'),
              year: year.get('title'),
              deleted: false
            },
            limit: 500
          }).then(function(courses){
            self.get('currentUser.schools').then(function(schools){
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
    }, 500);

    return defer.promise;
  },
  setupController: function(controller, hash){
    controller.set('schoolId', parseInt(hash.school.get('id')));
    controller.set('schools', hash.schools);
    controller.set('yearTitle', parseInt(hash.year.get('title')));
    controller.set('selectedSchool', hash.school);
    controller.set('selectedYear', hash.year);
    controller.set('years', hash.years);
    controller.set('content', hash.courses);
    this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.courses'));
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
