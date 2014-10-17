import Ember from 'ember';

export default Ember.ObjectController.extend({
  breadCrumb: 'All Programs',
  school: Ember.computed.alias('currentUser.currentSchool')
});
