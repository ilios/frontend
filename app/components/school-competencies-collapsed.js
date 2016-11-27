import Ember from 'ember';

const { Component, computed } = Ember;
const { reads, filterBy, sort } = computed;

export default Component.extend({
  school: null,
  tagName: 'section',
  classNames: ['school-competencies-collapsed'],
  competencies: reads('school.competencies'),
  allDomains: filterBy('competencies', 'isDomain'),
  allCompetencies: filterBy('competencies', 'isNotDomain'),
  sortDomainsBy: ['title'],
  domains: sort('allDomains', 'sortDomainsBy'),

});
