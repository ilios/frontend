import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  schoolTitle: Ember.computed.alias("programYear.model.program.owningSchool.title"),
  breadCrumbTranslation: 'programs.programYear.stewardingSchools',
  sortAscending: true,
  sortProperties: ['title']
});
