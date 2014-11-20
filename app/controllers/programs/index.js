import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'programs.selectSchool',
  sortAscending: true,
  sortProperties: ['title'],
});
