import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  sortAscending: true,
  sortProperties: ['title'],
});
