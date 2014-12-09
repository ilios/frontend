import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    var promises = {
        courses: this.store.find('course'),
        educationalYears: this.store.find('educational-year'),
        schools: this.currentUser.get('schools')
    };
    return Ember.RSVP.hash(promises);
  },
  setupController: function(controller, hash){
    controller.set('model', hash.courses);
    controller.set('educationalYears', hash.educationalYears);
    controller.set('schools', hash.schools);
  },
  queryParams: {
    filter: {
      replace: true
    }
  }
});
