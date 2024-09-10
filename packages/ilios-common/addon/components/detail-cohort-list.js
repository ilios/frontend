import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { mapBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class DetailCohortListComponent extends Component {
  @service intl;
  @tracked sortedCohorts = null;

  load = restartableTask(async (event, [cohorts]) => {
    if (!cohorts) {
      return false;
    }

    const sortProxies = await map(cohorts, async (cohort) => {
      const programYear = await cohort.programYear;
      const program = await programYear.program;
      const school = await program.school;
      const schoolTitle = school.title;
      let displayTitle = cohort.title;
      if (!displayTitle) {
        const programYear = await cohort.programYear;
        const year = await programYear.getClassOfYear();
        displayTitle = this.intl.t('general.classOf', { year });
      }

      return {
        cohort,
        schoolTitle,
        displayTitle,
      };
    });

    this.sortedCohorts = mapBy(sortBy(sortProxies, ['schoolTitle', 'displayTitle']), 'cohort');
  });
}
