import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['school-competencies-collapsed'],
  tagName: 'section',

  school: null,

  competencies: computed('school.competencies.[]', async function() {
    const school = this.school;
    const competencies = await school.get('competencies');
    return competencies;
  }),

  domains: computed('school.competencies.[]', async function() {
    const competencies = await this.competencies;
    const domains = competencies.filterBy('isDomain');
    return domains;
  }),

  childCompetencies: computed('school.competencies.[]', async function() {
    const competencies = await this.competencies;
    const childCompetencies = competencies.filterBy('isNotDomain');
    return childCompetencies;
  })
});
