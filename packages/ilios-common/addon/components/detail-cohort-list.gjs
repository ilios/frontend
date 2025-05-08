import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { map } from 'rsvp';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

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
  <template>
    <div class="detail-cohort-list">
      {{#if this.cohortsData.isResolved}}
        {{#if this.sortedCohorts.length}}
          <table>
            <thead>
              <tr>
                <th class="text-left">
                  {{t "general.school"}}
                </th>
                <th class="text-left">
                  {{t "general.program"}}
                </th>
                <th class="text-left">
                  {{t "general.cohort"}}
                </th>
              </tr>
            </thead>
            <tbody>
              {{#each this.sortedCohorts as |cohort|}}
                <tr>
                  <td class="text-left">
                    {{cohort.programYear.program.school.title}}
                  </td>
                  <td class="text-left">
                    {{cohort.programYear.program.title}}
                  </td>
                  <td class="text-left">
                    {{#if cohort.title}}
                      {{cohort.title}}
                    {{else}}
                      {{t "general.classOf" year=cohort.programYear.classOfYear}}
                    {{/if}}
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        {{else}}
          {{t "general.noCohorts"}}
        {{/if}}
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </div>
  </template>
}
