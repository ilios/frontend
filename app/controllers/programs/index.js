import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  sortAscending: true,
  sortProperties: ['title'],
});
