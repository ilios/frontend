import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { map, all } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import DetailCohortManager from 'ilios-common/components/detail-cohort-manager';
import DetailCohortList from 'ilios-common/components/detail-cohort-list';

export default class DetailCohortsComponent extends Component {
  @tracked isManaging = false;
  @tracked bufferedCohorts = [];

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.args.course.cohorts);
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  manage = dropTask(async () => {
    const cohorts = await this.args.course.cohorts;
    this.bufferedCohorts = [...cohorts];
    this.isManaging = true;
  });

  save = dropTask(async () => {
    const { course } = this.args;
    const cohortList = await course.cohorts;
    const removedCohorts = cohortList.filter((cohort) => {
      return !this.bufferedCohorts.includes(cohort);
    });
    if (removedCohorts.length) {
      const programYearsToRemove = await map(removedCohorts, async (cohort) => cohort.programYear);
      const objectives = await course.courseObjectives;
      await all(
        objectives.map((objective) => objective.removeParentWithProgramYears(programYearsToRemove)),
      );
    }
    course.set('cohorts', this.bufferedCohorts);
    await course.save();
    this.isManaging = false;
    this.bufferedCohorts = [];
  });

  @action
  cancel() {
    this.bufferedCohorts = [];
    this.isManaging = false;
  }
  @action
  addCohortToBuffer(cohort) {
    this.bufferedCohorts = [...this.bufferedCohorts, cohort];
  }
  @action
  removeCohortFromBuffer(cohort) {
    this.bufferedCohorts = this.bufferedCohorts.filter((obj) => obj.id !== cohort.id);
  }
  <template>
    <section class="detail-cohorts" data-test-detail-cohorts>
      <div class="detail-cohorts-header">
        <div class="title">
          {{#if this.isManaging}}
            <span class="specific-title">
              {{t "general.cohortsManageTitle"}}
            </span>
          {{else}}
            {{t "general.programCohorts"}}
            ({{@course.cohorts.length}})
          {{/if}}
        </div>
        <div class="actions">
          {{#if this.isManaging}}
            <button
              class="bigadd"
              aria-label={{t "general.save"}}
              type="button"
              {{on "click" (perform this.save)}}
            >
              <FaIcon
                @icon={{if this.save.isRunning "spinner" "check"}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button
              class="bigcancel"
              type="button"
              aria-label={{t "general.cancel"}}
              {{on "click" this.cancel}}
            >
              <FaIcon @icon="arrow-rotate-left" />
            </button>
          {{else if @editable}}
            <button type="button" {{on "click" (perform this.manage)}}>
              {{t "general.cohortsManageTitle"}}
            </button>
          {{/if}}
        </div>
      </div>
      <div class="detail-cohorts-content">
        {{#if this.isManaging}}
          <DetailCohortManager
            @course={{@course}}
            @selectedCohorts={{this.bufferedCohorts}}
            @add={{this.addCohortToBuffer}}
            @remove={{this.removeCohortFromBuffer}}
          />
        {{else}}
          <DetailCohortList @cohorts={{this.cohorts}} />
        {{/if}}
      </div>
    </section>
  </template>
}
