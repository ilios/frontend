import Ember from 'ember';

const { Component, computed } = Ember;
const { alias, filterBy } = computed;

export default Component.extend({
  subject: null,
  objectives: alias('subject.objectives'),
  objectivesWithParents: filterBy('objectives', 'hasParents', true),
  objectivesWithMesh: filterBy('objectives', 'hasMesh', true),
  actions: {
    toggleObjectiveDetails(){
      this.sendAction('toggleObjectiveDetails');
    }
  }
});
