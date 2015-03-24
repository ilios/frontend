import Ember from 'ember';

export default Ember.ObjectController.extend(Ember.I18n.TranslateableProperties, {
    currentUser: Ember.inject.service(),
    school: Ember.computed.alias('currentUser.currentSchool'),
});
