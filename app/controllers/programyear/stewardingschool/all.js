import Ember from 'ember';
import Controller from '../stewardingschool';

export default Controller.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  selected: function(){
    var self = this;
    var selected = false;
    if(this.get('model.id') === this.get('programYear.program.owningSchool.id')){
      selected = true;
    }
    this.get('programYear.stewardingSchools').forEach(function(school){
      if(school.get('id') === self.get('model').get('id')){
        selected = true;
      }
    });
    return selected;
  }.property('programYear.stewardingSchools.@each'),
});
