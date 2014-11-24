import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'courses.selectYear',
  sortAscending: true,
  sortProperties: ['title'],
});
