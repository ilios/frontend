import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'instructorGroups.selectSchool',
  sortAscending: true,
  sortProperties: ['title'],
});
