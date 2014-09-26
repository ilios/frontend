import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  sortAscending: true,
  sortProperties: ['title'],
});
