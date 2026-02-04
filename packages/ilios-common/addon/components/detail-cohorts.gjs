import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { filter, map, all } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import DetailCohortManager from 'ilios-common/components/detail-cohort-manager';
import DetailCohortList from 'ilios-common/components/detail-cohort-list';
import { faArrowRotateLeft, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

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

  manage = task({ drop: true }, async () => {
    const cohorts = await this.args.course.cohorts;
    this.bufferedCohorts = [...cohorts];
    this.isManaging = true;
  });

  save = task({ drop: true }, async () => {
    const { course } = this.args;
    const cohortList = await course.cohorts;
    const removedCohorts = cohortList.filter((cohort) => {
      return !this.bufferedCohorts.includes(cohort);
    });
    if (removedCohorts.length) {
      // get a hold of all course objectives in the given course.
      const courseObjectives = await course.courseObjectives;

      // get a hold of all program years linked to the cohorts that are about to be unlinked from the given course.
      const programYearsToRemove = await map(removedCohorts, async (cohort) => cohort.programYear);

      // get all the program year objectives linked to the given program years.
      const programYearObjectivesToUnlink = (
        await map(
          programYearsToRemove,
          async (programYear) => await programYear.programYearObjectives,
        )
      ).flat();

      // get all course objectives that are linked to the given program year objectives.
      // we'll break linkage further down in a separate step.
      // doing this in two steps allows us to ignore any course objectives that were NOT linked whilst saving.
      const courseObjectivesToUnlink = await filter(courseObjectives, async (courseObjective) => {
        const linkedProgramYearObjectives = await courseObjective.programYearObjectives;
        return linkedProgramYearObjectives.some((programYearObjective) =>
          programYearObjectivesToUnlink.includes(programYearObjective),
        );
      });

      // now, break linkage between the given course objectives and the given program year objectives.
      await map(courseObjectivesToUnlink, async (courseObjective) => {
        // @see https://guides.emberjs.com/release/models/relationships/#toc_removing-relationships
        const programYearObjectives = await courseObjective.programYearObjectives;
        courseObjective.programYearObjectives = programYearObjectives.filter(
          (programYearObjective) => !programYearObjectivesToUnlink.includes(programYearObjective),
        );
      });

      // save all given course objectives that need updating.
      await all(courseObjectivesToUnlink.map((courseObjective) => courseObjective.save()));
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
        <div class="title" data-test-title>
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
              data-test-save
            >
              <FaIcon
                @icon={{if this.save.isRunning faSpinner faCheck}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button
              class="bigcancel"
              type="button"
              aria-label={{t "general.cancel"}}
              {{on "click" this.cancel}}
              data-test-cancel
            >
              <FaIcon @icon={{faArrowRotateLeft}} />
            </button>
          {{else if @editable}}
            <button type="button" {{on "click" (perform this.manage)}} data-test-manage>
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
