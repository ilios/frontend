import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import { eq } from 'ember-truth-helpers';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';

import { sortBy } from '../../../../utils/array-helpers';
import LoadingSpinner from '../../../loading-spinner';

export default class ReportsSubjectNewAcademicYearComponent extends Component {
  @service store;
  @service iliosConfig;

  @cached
  get academicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get academicYears() {
    return this.academicYearsData.isResolved ? this.academicYearsData.value : [];
  }

  get sortedAcademicYears() {
    return sortBy(this.academicYears, ['title']).reverse();
  }

  get bestSelectedAcademicYear() {
    const ids = this.academicYears.map(({ id }) => id);

    if (ids.includes(this.args.currentId)) {
      return this.args.currentId;
    }

    return null;
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
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
    <p data-test-reports-subject-new-academic-year>
      <label for="new-term">
        {{t "general.whichIs"}}
      </label>
      {{#if this.academicYearsData.isResolved}}
        <select
          id="new-academic-year"
          data-test-prepositional-objects
          {{on "change" this.updatePrepositionalObjectId}}
        >
          <option selected={{isEmpty @currentId}} value>
            {{t "general.selectPolite"}}
          </option>
          {{#each this.sortedAcademicYears as |year|}}
            <option selected={{eq year.id this.bestSelectedAcademicYear}} value={{year.id}}>
              {{#if this.academicYearCrossesCalendarYearBoundaries}}
                {{year.id}}
                -
                {{add year.id 1}}
              {{else}}
                {{year.id}}
              {{/if}}
            </option>
          {{/each}}
        </select>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </p>
  </template>
}
