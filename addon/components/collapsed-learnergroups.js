import Component from '@glimmer/component';
import { map } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class CollapsedLearnergroupsComponent extends Component {
  @tracked
  cohortSummaries;

  @restartableTask
  *load(element, [learnerGroups]) {
    if (!learnerGroups) {
      return;
    }
    const cohorts = yield map(learnerGroups.toArray(), (group => group.get('cohort')));
    const summaryBlocks =  cohorts.reduce((set, cohort) => {
      const key = 'cohort' + cohort.get('id');
      if (!Object.keys(set).includes(key)) {
        set[key] = {
          cohort,
          count: 0
        };
      }

      set[key].count++;

      return set;
    }, {});

    this.cohortSummaries =  yield map(Object.keys(summaryBlocks), async key => {
      const cohort = summaryBlocks[key].cohort;
      const count = summaryBlocks[key].count;
      const program = await cohort.get('program');
      const title = [program.title, cohort.title].join(' ');

      return {
        title,
        count
      };
    });
  }
}
