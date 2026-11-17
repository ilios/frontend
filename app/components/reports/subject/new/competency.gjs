import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';

import { sortBy } from '../../../../utils/array-helpers';
import LoadingSpinner from '../../../loading-spinner';

export default class ReportsSubjectNewCompetencyComponent extends Component {
  @service store;

  @cached
  get allCompetenciesData() {
    return new TrackedAsyncData(this.store.findAll('competency'));
  }

  get allCompetencies() {
    return this.allCompetenciesData.isResolved ? this.allCompetenciesData.value : [];
  }

  get filteredCompetencies() {
    if (this.args.school) {
      return this.allCompetencies.filter((c) => c.belongsTo('school').id() === this.args.school.id);
    }

    return this.allCompetencies;
  }

  get sortedCompetencies() {
    return sortBy(this.filteredCompetencies, 'title');
  }

  get bestSelectedCompetency() {
    const ids = this.sortedCompetencies.map(({ id }) => id);
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
    <p data-test-reports-subject-new-competency>
      <label for="new-competency">
        {{t "general.whichIs"}}
      </label>
      {{#if this.allCompetenciesData.isResolved}}
        <select
          id="new-competency"
          data-test-prepositional-objects
          {{on "change" this.updatePrepositionalObjectId}}
        >
          <option selected={{isEmpty @currentId}} value>
            {{t "general.selectPolite"}}
          </option>
          {{#each this.sortedCompetencies as |competency|}}
            <option
              selected={{eq competency.id this.bestSelectedCompetency}}
              value={{competency.id}}
            >
              {{competency.title}}
            </option>
          {{/each}}
        </select>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </p>
  </template>
}
