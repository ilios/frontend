import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { all } from 'rsvp';
import { restartableTask } from 'ember-concurrency-decorators';

export default class CollapsedCompetenciesComponent extends Component {
  @tracked
  summary;

  @restartableTask
  *load(element, [competencies]) {
    if (!competencies) {
      return;
    }
    const schools = yield all(competencies.mapBy('school'));
    const schoolIds = schools.mapBy('id').uniq();
    this.summary = schoolIds.map((id) => {
      return {
        competencies: schools.filterBy('id', id),
        school: schools.findBy('id', id)
      };
    });
  }
}
