import Ember from 'ember';

const { computed, Component } = Ember;
const { sort, not } = computed;

export default Component.extend({
  classNames: ['programyear-objective-list'],
  programYear: null,
  editable: not('programYear.locked'),
  objectives: computed('programYear.objectives.[]', function(){
    return this.get('programYear').get('objectives');
  }),
  sortedObjectives: sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),

});
