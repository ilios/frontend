import Ember from 'ember';

const { computed, Component } = Ember;
const { sort } = computed;

export default Component.extend({
  programYear: null,
  objectives: computed('programYear.objectives.[]', function(){
    return this.get('programYear').get('objectives');
  }),
  sortedObjectives: sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),
  classNames: ['programyear-objective-list'],
});
