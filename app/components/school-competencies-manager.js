import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SchoolCompetenciesManagerComponent extends Component {
  get domains() {
    if (!this.args.competencies) {
      return [];
    }
    const domains = this.args.competencies.slice().filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
    const objs = domains.uniq().map((domain) => {
      if (!domain.id) {
        return {
          domain,
          competencies: [],
        };
      }
      const domainCompetencies = this.args.competencies.filter(
        (competency) => competency.belongsTo('parent').id() === domain.id
      );
      return {
        domain,
        competencies: domainCompetencies.sortBy('title'),
      };
    });

    return objs.sortBy('domain.title');
  }

  @action
  changeCompetencyTitle(value, competency) {
    competency.set('title', value);
  }
}
