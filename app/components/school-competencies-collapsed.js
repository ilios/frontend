import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  school: null,
  tagName: 'section',
  classNames: ['school-competencies-collapsed'],
  competencies: computed('school.competencies.[]', async function(){
    const school = this.get('school');
    const competencies = await school.get('competencies');

    return competencies;
  }),
  domains: computed('school.competencies.[]', async function(){
    const competencies = await this.get('competencies');
    const domains = competencies.filterBy('isDomain');

    return domains;
  }),
  childCompetencies: computed('school.competencies.[]', async function(){
    const competencies = await this.get('competencies');
    const childCompetencies = competencies.filterBy('isNotDomain');

    return childCompetencies;
  }),
});
