import Ember from 'ember';

const { Component, computed } = Ember;
const { sort } = computed;

export default Component.extend({
  competencies: [],
  sortCompetenciesBy: ['title'],
  sortedCompetencies: sort('competencies', 'sortCompetenciesBy'),
  newCompetencyValue: null,
  actions: {
    commit(){
      let value = this.get('newCompetencyValue');
      if (value.length) {
        this.attrs.add(value);
        this.set('newCompetencyValue', null);
      }
    }
  }
});
