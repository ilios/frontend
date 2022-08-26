import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';

export default class DetailCohortListComponent extends Component {
  @service intl;
  @tracked sortedCohorts = null;

  load = restartableTask(async (event, [cohorts]) => {
    if (!cohorts) {
      return false;
    }

    const sortProxies = await map(cohorts.toArray(), async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;
      const schoolTitle = school.title;
      let displayTitle = cohort.title;
      if (!displayTitle) {
        const classOfYear = await cohort.classOfYear;
        displayTitle = this.intl.t('general.classOf', { year: classOfYear });
      }

      return {
        cohort,
        schoolTitle,
        displayTitle,
      };
    });

    this.sortedCohorts = sortProxies.sortBy('schoolTitle', 'displayTitle').mapBy('cohort');
  });
}
