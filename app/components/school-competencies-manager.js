import Ember from 'ember';

const { Component, computed, isPresent, isEmpty } = Ember;
const { sort } = computed;

export default Component.extend({
  competencies: [],
  sortCompetenciesBy: ['title'],
  sortedCompetencies: sort('competencies', 'sortCompetenciesBy'),

  domains: computed('competencies.[]', function(){
    let competencies = this.get('competencies');
    if(isEmpty(competencies)){
      return [];
    }
    let domains = competencies.filterBy('isDomain');
    let objs = domains.uniq().map(domain => {
      let domainCompetencies = competencies.filter(competency => competency.get('parent.id') === domain.get('id'));
      return {
        domain,
        competencies: domainCompetencies.sortBy('title')
      };
    });

    return objs.sortBy('domain.title');
  }),
  actions: {
    changeCompetencyTitle(value, competency){
      competency.set('title', value);
      competency.save();
    }
  }
});
