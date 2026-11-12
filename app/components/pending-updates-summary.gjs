import { get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBuildingColumns, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';
import { eq, gt } from 'ember-truth-helpers';
import { filter } from 'rsvp';

import pick from '../helpers/pick';
import sortBy from '../helpers/sort-by';
import { findById } from '../utils/array-helpers';
import LoadingSpinner from './loading-spinner';

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
  <template>
    <div
      class="pending-updates-summary small-component{{if this.haveUpdates ' alert'}}"
      data-test-pending-updates-summary
      ...attributes
    >
      <h3 data-test-title>
        {{#if this.haveUpdates}}
          <FaIcon @icon={{faTriangleExclamation}} class="no" />
        {{/if}}
        {{t "general.pendingUpdatesSummaryTitle"}}
      </h3>
      <div id="schoolsfilter" class="filter" data-test-schools>
        <label class="inline-label">
          <FaIcon @icon={{faBuildingColumns}} @title={{t "general.school"}} />
        </label>
        <div id="school-selection" class="inline-data">
          {{#if (gt @schools.length 1)}}
            <select
              aria-label={{t "general.school"}}
              {{on "change" (pick "target.value" (set this "selectedSchoolId"))}}
            >
              {{#each (sortBy "title" @schools) as |school|}}
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
  </template>
}
