import Ember from 'ember';

export default Ember.ObjectController.extend(Ember.I18n.TranslateableProperties, {
  school: Ember.computed.alias('currentUser.currentSchool')
});
