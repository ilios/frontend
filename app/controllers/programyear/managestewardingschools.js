import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'programs.programYear.stewardingSchools',
  sortAscending: true,
  sortProperties: ['title'],
});
