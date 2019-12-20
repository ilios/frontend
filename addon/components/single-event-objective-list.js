import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SingleEventObjectiveList extends Component {
  @tracked groupByCompetencies = true;

  get showDisplayModeToggle() {
    if (! this.args.objectives) {
      return false;
    }
    return !! this.args.objectives.reduce((prevValue, objective) => {
      return Math.max(prevValue, objective.position);
    }, 0);
  }

  get domains() {
    if (! this.args.objectives) {
      return [];
    }

    let domainTitles = this.args.objectives.map(obj => {
      return obj.domain.toString();
    });

    domainTitles = domainTitles.uniq();

    const domains = domainTitles.map(title => {
      const domain = {
        title,
        objectives: []
      };
      const filteredObjectives = this.args.objectives.filter(obj => {
        return obj.domain.toString() === title;
      }).map(obj => {
        return obj.title;
      });
      domain.objectives = filteredObjectives.sortBy('title');

      return domain;
    });

    return domains.sortBy('title');
  }
}
