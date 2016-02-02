import Ember from 'ember';

const { Component, computed } = Ember;
const { alias, sort } = computed;

export default Component.extend({
  subject: null,
  isCourse: false,
  isSession: false,
  isProgramYear: false,
  objectives: alias('subject.objectives'),
  sortedObjectives: sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),
  actions: {
    toggleObjectiveDetails(){
      this.sendAction('toggleObjectiveDetails');
    }
  }
});
