import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import sortCohorts from 'frontend/utils/sort-cohorts';
import t from 'ember-intl/helpers/t';

export default class UserProfileCohortsDetailsComponent extends Component {
  @cached
  get sortedSecondaryCohortsData() {
    return new TrackedAsyncData(sortCohorts(this.args.secondaryCohorts));
  }

  get sortedSecondaryCohortsLoaded() {
    return this.sortedSecondaryCohortsData.isResolved;
  }

  get sortedSecondaryCohorts() {
    return this.sortedSecondaryCohortsData.isResolved ? this.sortedSecondaryCohortsData.value : [];
  }
  <template>
    <div class="user-profile-cohorts-details" data-test-user-profile-cohorts-details>
      <p data-test-primary-cohort>
        <h3>
          {{t "general.primaryCohort"}}:
        </h3>
        <span data-test-title>
          {{#if @primaryCohort}}
            {{@primaryCohort.programYear.program.school.title}}
            <strong>
              {{@primaryCohort.programYear.program.title}}
            </strong>
            {{@primaryCohort.title}}
          {{else}}
            {{t "general.none"}}
          {{/if}}
        </span>
      </p>
      <p data-test-secondary-cohorts>
        <h3>
          {{t "general.secondaryCohorts"}}:
        </h3>
        {{#if this.sortedSecondaryCohortsLoaded}}
          <ul>
            {{#each this.sortedSecondaryCohorts as |cohort|}}
              <li>
                <span data-test-title>
                  {{cohort.programYear.program.school.title}}
                  <strong>
                    {{cohort.programYear.program.title}}
                  </strong>
                  {{cohort.title}}
                </span>
              </li>
            {{else}}
              <li>
                <span data-test-title>
                  {{t "general.none"}}
                </span>
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </p>
    </div>
  </template>
}
