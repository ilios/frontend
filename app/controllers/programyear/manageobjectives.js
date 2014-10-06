import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'general.objectives',
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  sortAscending: true,
  sortProperties: ['title'],
  newObjectives: Ember.A(),
  actions: {
    createNew: function(){
      var objective = this.store.createRecord('objective', {
        title: null,
        programYear: this.get('programYear.model'),
        competency:  this.get('programYear.competencies').get('firstObject')
      });
      this.get('model').pushObject(objective);
    }
  }
});
