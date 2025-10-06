import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';
import { hash } from 'rsvp';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import add from 'ember-math-helpers/helpers/add';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import eq from 'ember-truth-helpers/helpers/eq';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectNewProgramYearComponent extends Component {
  @service store;
  @service iliosConfig;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  @cached
  get mappedProgramYearsData() {
    return new TrackedAsyncData(
      hash({
        programs: this.store.findAll('program'),
        programYears: this.store.findAll('program-year'),
      }),
    );
  }

  get mappedProgramYears() {
    if (this.mappedProgramYearsData.isResolved) {
      return this.mappedProgramYearsData.value.programYears.map((programYear) => {
        const programId = programYear.belongsTo('program').id();
        const program = this.mappedProgramYearsData.value.programs.find(
          ({ id }) => id === programId,
        );
        const schoolId = program.belongsTo('school').id();

        return {
          programYear,
          program,
          schoolId,
        };
      });
    } else {
      return [];
    }
  }

  get filteredProgramYears() {
    if (this.args.school) {
      return this.mappedProgramYears.filter(({ schoolId }) => schoolId === this.args.school.id);
    }

    return this.mappedProgramYears;
  }

  get sortedProgramYears() {
    return sortBy(this.filteredProgramYears, [
      'programYear.classOfYear',
      'program.title',
    ]).reverse();
  }

  get programYears() {
    return this.sortedProgramYears.map(({ programYear }) => programYear);
  }

  get bestSelectedProgramYear() {
    const ids = this.programYears.map(({ id }) => id);
    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return null;
  }

  @action
  updatePrepositionalObjectId(event) {
    const value = event.target.value;
    this.args.changeId(value);

    if (!isNaN(value)) {
      event.target.classList.remove('error');
    }
  }
  <template>
    <p data-test-reports-subject-new-program-year>
      <label for="new-program-year">
        {{t "general.whichIs"}}
      </label>
      {{#if this.mappedProgramYearsData.isResolved}}
        <select
          id="new-program-year"
          data-test-prepositional-objects
          {{on "change" this.updatePrepositionalObjectId}}
        >
          <option selected={{isEmpty @currentId}} value>
            {{t "general.selectPolite"}}
          </option>
          {{#each this.programYears as |programYear|}}
            <option
              selected={{eq programYear.id this.bestSelectedProgramYear}}
              value={{programYear.id}}
            >
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{programYear.startYear}}
                -
                {{add programYear.startYear 1}}
              {{else}}
                {{programYear.startYear}}
              {{/if}}
              ({{t "general.classOf" year=programYear.classOfYear}})
              {{programYear.program.title}}
            </option>
          {{/each}}
        </select>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </p>
  </template>
}
