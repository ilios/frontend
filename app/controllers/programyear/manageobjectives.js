import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  sortAscending: true,
  sortProperties: ['title'],
  //override the title sort to push new objectives to the bottom
  sortFunction: function(a,b){
    if(a == null){
      return 1;
    }
    if(b == null){
      return -1;
    }
    return Ember.compare(a,b);
  },
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
