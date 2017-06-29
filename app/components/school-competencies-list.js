import Ember from 'ember';

const { Component, computed } = Ember;
const { filterBy, sort } = computed;

export default Component.extend({
  competencies: [],
  classNames: ['school-competencies-list'],
  allDomains: filterBy('competencies', 'isDomain'),
  sortDomainsBy: ['title'],
  domains: sort('allDomains', 'sortDomainsBy'),
});
