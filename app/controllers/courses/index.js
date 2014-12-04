import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'courses.selectSchool',
  sortAscending: true,
  sortProperties: ['title'],
});
