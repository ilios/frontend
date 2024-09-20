import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { map } from 'rsvp';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailCohortListComponent extends Component {
  @service intl;

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.getCohortProxies(this.args.cohorts ?? []));
  }

  get sortedCohorts() {
    if (!this.cohortsData.isResolved) {
      return [];
    }

    return sortBy(this.cohortsData.value, ['schoolTitle', 'displayTitle']).map(
      ({ cohort }) => cohort,
    );
  }

  async getCohortProxies(cohorts) {
    return await map(cohorts, async (cohort) => {
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
  }
}
