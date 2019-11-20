import Component from '@ember/component';
import  {
  all,
  filter
} from 'rsvp';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['objective-manager', 'objective-manage-competency'],

  schoolCompetencies: computed('programYear.program.school.competencies.[]', async function () {
    const programYear = await this.programYear;
    const program = await programYear.program;
    const school = await program.school;
    return await school.competencies;
  }),

  programYear: computed('objective.programYears.[]', async function () {
    const programYears = await this.objective.programYears;
    if (programYears.length) {
      return programYears.toArray()[0];
    }
    return null;
  }),

  competencies: computed('programYear.competencies.[]', async function () {
    const programYear = await this.programYear;
    const competencies = await programYear.competencies;
    return competencies;
  }),

  competenciesWithSelectedChildren: computed('schoolCompetencies.[]', 'objective.competency', async function () {
    const selectedCompetency = await this.objective.competency;
    if (selectedCompetency) {
      const selectedCompetencyId = selectedCompetency.get('id');
      const competencies = await this.schoolCompetencies;
      return await filter(competencies.toArray(), async competency => {
        const children = await competency.treeChildren;
        const selectedChildren = children.filterBy('id', selectedCompetencyId);
        return selectedChildren.length > 0;
      });
    }
    return [];
  }),

  domains: computed('competencies.[]', async function () {
    const competencies = await this.competencies;
    const domains = await all(competencies.mapBy('domain'));
    return domains.uniq();
  }),

  domainsWithNoChildren: computed('domains.[]', async function () {
    const competencies = await this.competencies;
    const domains = await this.domains;
    return await filter(domains.toArray(), async domain => {
      const children = await domain.children;
      let availableChildren = children.filter(child => competencies.includes(child));
      return availableChildren.length === 0;
    });
  }),

  actions: {
    changeCompetency(competency) {
      this.get('objective').set('competency', competency);
    },
    removeCurrentCompetency() {
      this.get('objective').set('competency', null);
    }
  }
});
