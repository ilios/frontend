import Ember from 'ember';

const { Component, computed } = Ember;
const { reads, filterBy, sort } = computed;

export default Component.extend({
  school: null,
  competencies: reads('school.competencies'),
  allDomains: filterBy('competencies', 'isDomain'),
  allCompetencies: filterBy('competencies', 'isNotDomain'),
  sortDomainsBy: ['title'],
  domains: sort('allDomains', 'sortDomainsBy'),

});
