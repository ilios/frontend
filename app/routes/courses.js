import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    var promises = {
        courses: this.store.find('course'),
        educationalYears: this.store.find('educational-year'),
        schools: this.store.find('school')
    };
    return Ember.RSVP.hash(promises);
  },
  setupController: function(controller, hash){
    this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.courses'));
    controller.set('model', hash.courses);
    controller.set('educationalYears', hash.educationalYears);
    controller.set('availableSchools', hash.schools);
  },
  queryParams: {
    filter: {
      replace: true
    }
  }
});
