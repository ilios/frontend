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
    createNewCompetencyFromButton(e){
      let domainId = parseInt(e.target.value);
      let value = this.$(e.target).parent().find('input').val();
      let objs = this.get('domains');
      let obj = objs.find(obj => parseInt(obj.domain.get('id')) === domainId);
      let domain = obj.domain;
      if (isPresent(value) && isPresent(domain)) {
        this.attrs.add(value, domain);
      }

    },
    createNewCompetencyFromInput(e){
      if (e.keyCode === 13) {
        let value = e.target.value;
        let domainId = parseInt(this.$(e.target).parent().find('button').val());

        let objs = this.get('domains');
        let obj = objs.find(obj => parseInt(obj.domain.get('id')) === domainId);
        let domain = obj.domain;
        if (isPresent(value) && isPresent(domain)) {
          this.attrs.add(value, domain);
        }
      }

    },
    changeCompetencyTitle(value, competency){
      competency.set('title', value);
      competency.save();
    }
  }
});
