import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { findById } from 'ilios-common/utils/array-helpers';

export default class PendingUpdatesSummaryComponent extends Component {
  @service currentUser;
  @service store;
  @tracked selectedSchoolId;

  userModel = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get user() {
    return this.userModel.isResolved ? this.userModel.value : null;
  }

  @cached
  get allUpdatesData() {
    const schools = this.args.schools.map((s) => s.id);
    return new TrackedAsyncData(
      this.store.query('pending-user-update', {
        filters: { schools },
        include: 'user',
      }),
    );
  }

  get allUpdates() {
    return this.allUpdatesData.isResolved ? this.allUpdatesData.value : null;
  }

  @cached
  get updatesData() {
    return new TrackedAsyncData(
      this.getUpdatesForSchool(this.allUpdatesArray, this.bestSelectedSchool),
    );
  }

  get updates() {
    return this.updatesData.isResolved ? this.updatesData.value : [];
  }

  get haveUpdates() {
    return this.updates?.length > 0;
  }

  get bestSelectedSchool() {
    const id = this.selectedSchoolId ?? this.user?.belongsTo('school').id();
    if (id) {
      const school = findById(this.args.schools, id);
      if (school) {
        return school;
      }
    }
    return this.args.schools[0];
  }

  get areUpdatesLoaded() {
    return Boolean(this.allUpdates);
  }

  get allUpdatesArray() {
    if (!this.allUpdates) {
      return [];
    }

    return this.allUpdates;
  }

  async getUpdatesForSchool(allUpdates, selectedSchool) {
    return filter(allUpdates, async (update) => {
      const user = await update.user;
      return user.belongsTo('school').id() === selectedSchool.id;
    });
  }
}

{{#let (unique-id) as |template-id|}}
  <div
    class="pending-updates-summary small-component {{if this.haveUpdates 'alert'}}"
    data-test-pending-updates-summary
    ...attributes
  >
    <h3 data-test-title>
      {{#if this.haveUpdates}}
        <FaIcon @icon="triangle-exclamation" class="no" />
      {{/if}}
      {{t "general.pendingUpdatesSummaryTitle"}}
    </h3>
    <div id="schoolsfilter" class="filter" data-test-schools>
      <label class="inline-label" for="schools-{{template-id}}">
        <FaIcon @icon="building-columns" @title={{t "general.school"}} />
      </label>
      <div id="school-selection" class="inline-data">
        {{#if (gt @schools.length 1)}}
          <select
            id="schools-{{template-id}}"
            {{on "change" (pick "target.value" (set this "selectedSchoolId"))}}
          >
            {{#each (sort-by "title" @schools) as |school|}}
              <option value={{school.id}} selected={{eq school.id this.bestSelectedSchool.id}}>
                {{school.title}}
              </option>
            {{/each}}
          </select>
        {{else}}
          {{this.bestSelectedSchool.title}}
        {{/if}}
      </div>
    </div>
    {{#if this.areUpdatesLoaded}}
      <p data-test-summary>
        {{t "general.pendingUpdatesSummary" count=(get this.updates "length")}}
      </p>
      {{#if (get this.updates "length")}}
        <div class="actions" data-test-actions>
          <LinkTo
            @route="pending-user-updates"
            @query={{hash school=this.bestSelectedSchool.id}}
            data-test-manage
          >
            <button type="button">
              {{t "general.manage"}}
            </button>
          </LinkTo>
        </div>
      {{/if}}
    {{else}}
      <LoadingSpinner />
    {{/if}}
  </div>
{{/let}}