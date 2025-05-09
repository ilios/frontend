import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import eq from 'ember-truth-helpers/helpers/eq';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class ReportsSubjectNewInstructorGroupComponent extends Component {
  @service store;

  @cached
  get allInstructorGroupsData() {
    return new TrackedAsyncData(this.store.findAll('instructor-group'));
  }

  get allInstructorGroups() {
    return this.allInstructorGroupsData.isResolved ? this.allInstructorGroupsData.value : [];
  }

  get filteredInstructorGroups() {
    if (this.args.school) {
      return this.allInstructorGroups.filter(
        (c) => c.belongsTo('school').id() === this.args.school.id,
      );
    }

    return this.allInstructorGroups;
  }

  get sortedInstructorGroups() {
    return sortBy(this.filteredInstructorGroups, 'title');
  }

  get bestSelectedInstructorGroup() {
    const ids = this.sortedInstructorGroups.map(({ id }) => id);
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
    <p data-test-reports-subject-new-instructor-group>
      <label for="new-instructor-group">
        {{t "general.whichIs"}}
      </label>
      {{#if this.allInstructorGroupsData.isResolved}}
        <select
          id="new-instructor-group"
          data-test-prepositional-objects
          {{on "change" this.updatePrepositionalObjectId}}
        >
          <option selected={{isEmpty @currentId}} value>
            {{t "general.selectPolite"}}
          </option>
          {{#each this.sortedInstructorGroups as |instructorGroup|}}
            <option
              selected={{eq instructorGroup.id this.bestSelectedInstructorGroup}}
              value={{instructorGroup.id}}
            >
              {{instructorGroup.title}}
            </option>
          {{/each}}
        </select>
      {{else}}
        <LoadingSpinner />
      {{/if}}
    </p>
  </template>
}
