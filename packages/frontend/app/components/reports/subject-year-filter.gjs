import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ReportsSubjectYearFilter extends Component {
  @service store;

  @cached
  get allAcademicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get allAcademicYears() {
    return this.allAcademicYearsData.isResolved ? this.allAcademicYearsData.value : null;
  }
}

<div class="years-filter" data-test-report-subject-year-filter>
  <label>{{t "general.academicYear"}}
    <select data-test-year-filter {{on "change" (pick "target.value" @changeYear)}}>
      <option selected={{is-empty @selectedYear}} value="">
        {{t "general.allAcademicYears"}}
      </option>
      {{#each (sort-by "title:desc" this.allAcademicYears) as |year|}}
        <option value={{year.id}} selected={{eq year.id @selectedYear}}>
          {{year.title}}
        </option>
      {{/each}}
    </select>
  </label>
</div>