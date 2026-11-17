import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';

import pick from '../../helpers/pick';
import sortBy from '../../helpers/sort-by';

export default class ReportsSubjectYearFilterComponent extends Component {
  @service store;

  @cached
  get allAcademicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get allAcademicYears() {
    return this.allAcademicYearsData.isResolved ? this.allAcademicYearsData.value : null;
  }
  <template>
    <div class="years-filter" data-test-report-subject-year-filter>
      <label>{{t "general.academicYear"}}
        <select data-test-year-filter {{on "change" (pick "target.value" @changeYear)}}>
          <option selected={{isEmpty @selectedYear}} value>
            {{t "general.allAcademicYears"}}
          </option>
          {{#each (sortBy "title:desc" this.allAcademicYears) as |year|}}
            <option value={{year.id}} selected={{eq year.id @selectedYear}}>
              {{year.title}}
            </option>
          {{/each}}
        </select>
      </label>
    </div>
  </template>
}
