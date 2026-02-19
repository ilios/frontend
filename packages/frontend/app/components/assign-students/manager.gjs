import Component from '@glimmer/component';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { cached, tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import sortBy from 'ilios-common/helpers/sort-by';
import { and, eq, gt, lt, not, or } from 'ember-truth-helpers';
import { fn } from '@ember/helper';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import includes from 'ilios-common/helpers/includes';
import { LinkTo } from '@ember/routing';
import UserNameInfo from 'ilios-common/components/user-name-info';

export default class AssignStudentsManagerComponent extends Component {
  @service store;
  @service dataLoader;

  @tracked primaryCohortId = null;

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.dataLoader.loadSchoolsForLearnerGroups());
  }

  @cached
  get data() {
    return {
      programs: this.store.peekAll('program'),
      programYears: this.store.peekAll('program-year'),
      cohorts: this.store.peekAll('cohort'),
    };
  }

  @cached
  get programs() {
    return this.data.programs.filter(
      (program) => program.belongsTo('school').id() === this.args.school.id,
    );
  }

  @cached
  get programYears() {
    const programIds = this.programs.map(({ id }) => id);

    return this.data.programYears.filter((programYear) =>
      programIds.includes(programYear.belongsTo('program').id()),
    );
  }

  @cached
  get schoolCohorts() {
    const programYearIds = this.programYears.map(({ id }) => id);

    return this.data.cohorts.filter((cohort) =>
      programYearIds.includes(cohort.belongsTo('programYear').id()),
    );
  }

  get cohorts() {
    const cohortsWithData = this.schoolCohorts.map((cohort) => {
      const programYear = findById(this.programYears, cohort.belongsTo('programYear').id());
      const program = findById(this.programs, programYear.belongsTo('program').id());
      return {
        id: cohort.id,
        model: cohort,
        title: program.title + ' ' + cohort.title,
        startYear: Number(programYear.startYear),
        duration: Number(program.duration),
      };
    });

    const lastYear = DateTime.now().minus({ year: 1 }).year;
    return cohortsWithData.filter((obj) => {
      const finalYear = obj.startYear + obj.duration;
      return finalYear > lastYear;
    });
  }

  get bestSelectedCohort() {
    if (!this.schoolData.isResolved) {
      return false;
    }

    if (this.primaryCohortId) {
      const currentCohort = findById(this.cohorts, this.primaryCohortId);
      return currentCohort ?? false;
    } else {
      return this.cohorts.reverse()[0];
    }
  }
  <template>
    <div class="assign-students-manager" data-test-assign-students-manager>
      <div class="header">
        <h2 data-test-title>
          {{t "general.unassignedStudentsSummaryTitle"}}
        </h2>
      </div>
      <div class="form" data-test-cohorts>
        {{#if this.cohorts.length}}
          <label>
            {{t "general.unassignedStudentsConfirmation" count=@selectedStudents.length}}:
          </label>
          {{#if this.bestSelectedCohort}}
            <select
              aria-label={{t "general.cohorts"}}
              disabled={{@isSaving}}
              {{on "change" (pick "target.value" (set this "primaryCohortId"))}}
            >
              {{#each (sortBy "title" this.cohorts) as |cohort|}}
                <option selected={{eq cohort.id this.bestSelectedCohort.id}} value={{cohort.id}}>
                  {{cohort.title}}
                </option>
              {{/each}}
            </select>
            <button
              type="button"
              class="done text"
              disabled={{or @isSaving (lt this.cohorts.length 1) (eq @selectedStudents.length 0)}}
              data-test-submit
              {{on "click" (fn @save this.bestSelectedCohort)}}
            >
              {{#if @isSaving}}
                <LoadingSpinner />
              {{else}}
                {{t "general.save"}}
              {{/if}}
            </button>
          {{/if}}
        {{else}}
          <div class="no-cohorts" data-test-no-cohorts>{{t
              "general.noCohortsAvailableForStudentAssignment"
            }}</div>
        {{/if}}
      </div>
      <div class="list">
        <table class="ilios-table ilios-table-colors ilios-zebra-table">
          <thead>
            <tr>
              <th class="text-left clickable" colspan="1">
                <label>
                  <input
                    checked={{and
                      @selectableStudents.length
                      (eq @selectedStudents.length @selectableStudents.length)
                    }}
                    type="checkbox"
                    indeterminate={{and
                      (gt @selectedStudents.length 0)
                      (lt @selectedStudents.length @selectableStudents.length)
                    }}
                    disabled={{or
                      @isSaving
                      (not @selectableStudents.length)
                      (not this.cohorts.length)
                    }}
                    {{on "click" @changeAllUserSelections}}
                    data-test-toggle-all
                  />
                  {{t "general.all"}}
                </label>
              </th>
              <th class="text-left" colspan="4">
                {{t "general.fullName"}}
              </th>
              <th class="text-left" colspan="4">
                {{t "general.email"}}
              </th>
              <th class="text-left" colspan="2">
                {{t "general.campusId"}}
              </th>
            </tr>
          </thead>
          <tbody>
            {{#each @selectableStudents as |user|}}
              <tr class={{if (includes user @selectedStudents) "highlighted"}} data-test-student>
                <td class="text-left" colspan="1">
                  <input
                    type="checkbox"
                    aria-label={{if
                      (includes user @selectedStudents)
                      (t "general.deselectUser")
                      (t "general.selectUser")
                    }}
                    checked={{if (includes user @selectedStudents) "checked"}}
                    disabled={{or @isSaving (not this.cohorts.length)}}
                    data-test-toggle
                    {{on "click" (fn @changeUserSelection user.id)}}
                  />
                </td>
                <td class="text-left" colspan="4" data-test-name>
                  <LinkTo @route="user" @model={{user}}>
                    <UserNameInfo @user={{user}} />
                  </LinkTo>
                </td>
                <td class="text-left" colspan="4" data-test-email>
                  {{user.email}}
                </td>
                <td class="text-left" colspan="2" data-test-campus-id>
                  {{user.campusId}}
                </td>
              </tr>
            {{else}}
              <tr data-test-no-result>
                <td colspan="11" class="text-center">
                  {{t "general.noResultsFound"}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    </div>
  </template>
}
