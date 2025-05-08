import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class ReportsSubjectNewSessionTypeComponent extends Component {
  @service store;

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.store.findAll('session-type'));
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : [];
  }

  get filteredSessionTypes() {
    if (this.args.school) {
      return this.sessionTypes.filter((st) => st.belongsTo('school').id() === this.args.school.id);
    }

    return this.sessionTypes;
  }

  get sortedSessionTypes() {
    return sortBy(this.filteredSessionTypes, 'title');
  }

  get bestSelectedSessionType() {
    const ids = this.sessionTypes.map(({ id }) => id);
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
}

<p data-test-reports-subject-new-session-type>
  <label for="new-session-type">
    {{t "general.whichIs"}}
  </label>
  {{#if this.sessionTypesData.isResolved}}
    <select
      id="new-session-type"
      data-test-prepositional-objects
      {{on "change" this.updatePrepositionalObjectId}}
    >
      <option selected={{is-empty @currentId}} value="">
        {{t "general.selectPolite"}}
      </option>
      {{#each this.sortedSessionTypes as |sessionType|}}
        <option
          selected={{eq sessionType.id this.bestSelectedSessionType}}
          value={{sessionType.id}}
        >
          {{sessionType.title}}
          {{#unless sessionType.active}}
            ({{t "general.inactive"}})
          {{/unless}}
        </option>
      {{/each}}
    </select>
  {{else}}
    <LoadingSpinner />
  {{/if}}
</p>