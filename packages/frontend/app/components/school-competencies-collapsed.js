import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolCompetenciesCollapsedComponent extends Component {
  @tracked competenciesRelationship;

  @cached
  get schoolCompetenciesData() {
    return new TrackedAsyncData(this.args.school.competencies);
  }

  get competencies() {
    if (this.schoolCompetenciesData.isResolved) {
      return this.schoolCompetenciesData.value;
    }

    return [];
  }

  get domains() {
    return this.competencies.filter((competency) => {
      return !competency.belongsTo('parent').id();
    });
  }

  get notDomains() {
    return this.competencies.filter((competency) => {
      return competency.belongsTo('parent').id();
    });
  }
}
