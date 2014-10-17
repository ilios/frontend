import Ember from 'ember';

export default Ember.ObjectController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'programs.allPrograms',
  school: Ember.computed.alias('currentUser.currentSchool')
});
