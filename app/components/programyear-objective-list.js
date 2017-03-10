import Ember from 'ember';

const { computed, Component } = Ember;
const { not } = computed;

export default Component.extend({
  classNames: ['programyear-objective-list'],
  programYear: null,
  editable: not('programYear.locked'),
  objectives: computed('programYear.objectives.[]', function(){
    return this.get('programYear').get('objectives');
  }),
});
