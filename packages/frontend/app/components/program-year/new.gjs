import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { findBy, mapBy } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import { uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import focus from 'ilios-common/modifiers/focus';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class NewProgramYearComponent extends Component {
  allYears = [];
  @tracked year;

  get existingStartYears() {
    return mapBy(this.args.programYears ?? [], 'startYear').map(Number);
  }

  get selectedYear() {
    if (!this.year) {
      return this.availableAcademicYears[0];
    }
    return findBy(this.availableAcademicYears, 'value', this.year);
  }

  get availableAcademicYears() {
    return this.allYears
      .filter((year) => !this.existingStartYears.includes(year))
      .map((startYear) => {
        return {
          label: this.args.academicYearCrossesCalendarYearBoundaries
            ? `${startYear} - ${startYear + 1}`
            : startYear.toString(),
          value: startYear.toString(),
        };
      });
  }

  constructor() {
    super(...arguments);
    const firstYear = new Date().getFullYear() - 5;
    for (let i = 0; i < 10; i++) {
      this.allYears.push(firstYear + i);
    }
  }

  saveNewYear = task({ drop: true }, async () => {
    await this.args.save(this.selectedYear.value);
  });
  <template>
    <div class="new-program-year" data-test-new-program-year ...attributes>
      <h3 class="title" data-test-title>
        {{t "general.newProgramYear"}}
      </h3>
      <div class="form">
        <div class="startyear-select" data-test-start-year>
          {{#let (uniqueId) as |yearId|}}
            <label for={{yearId}}>
              {{t "general.academicYear"}}:
            </label>
            <select
              id={{yearId}}
              {{focus}}
              {{on "change" (pick "target.value" (set this "year"))}}
              data-test-year
            >
              {{#each (sortBy "value" this.availableAcademicYears) as |obj|}}
                <option value={{obj.value}} selected={{eq obj.value this.selectedYear.value}}>
                  {{obj.label}}
                </option>
              {{/each}}
            </select>
          {{/let}}
        </div>
        <div class="buttons">
          <button
            type="button"
            class="done text"
            {{on "click" (perform this.saveNewYear)}}
            data-test-done
          >
            {{#if this.saveNewYear.isRunning}}
              <LoadingSpinner />
            {{else}}
              {{t "general.done"}}
            {{/if}}
          </button>
          <button type="button" class="cancel text" {{on "click" @cancel}} data-test-cancel>
            {{t "general.cancel"}}
          </button>
        </div>
      </div>
    </div>
  </template>
}
