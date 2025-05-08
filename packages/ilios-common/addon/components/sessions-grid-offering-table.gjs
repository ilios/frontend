import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import OfferingDateBlock from 'ilios-common/utils/offering-date-block';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class SessionsGridOfferingTable extends Component {
  @service permissionChecker;

  @cached
  get canUpdateData() {
    return new TrackedAsyncData(this.permissionChecker.canUpdateSession(this.args.session));
  }

  get canUpdate() {
    return this.canUpdateData.isResolved ? this.canUpdateData.value : false;
  }

  @cached
  get offerings() {
    return new TrackedAsyncData(this.args.session.offerings);
  }

  get offeringBlocks() {
    if (!this.offerings.isResolved) {
      return [];
    }
    const dateBlocks = {};
    this.offerings.value.forEach((offering) => {
      const key = offering.get('dateKey');
      if (!(key in dateBlocks)) {
        dateBlocks[key] = new OfferingDateBlock(key);
      }
      dateBlocks[key].addOffering(offering);
    });
    //convert indexed object to array
    const dateBlockArray = [];
    let key;
    for (key in dateBlocks) {
      dateBlockArray.push(dateBlocks[key]);
    }
    return sortBy(dateBlockArray, 'dateStamp');
  }
}

<table class="sessions-grid-offering-table" data-test-sessions-grid-offering-table>
  <thead class={{if @headerIsLocked "locked"}}>
    <tr>
      <th colspan="2">
        {{t "general.when"}}
      </th>
      <th>
        {{t "general.location"}}
      </th>
      <th colspan="2">
        {{t "general.learners"}}
      </th>
      <th colspan="2">
        {{t "general.learnerGroups"}}
      </th>
      <th colspan="2">
        {{t "general.instructors"}}
      </th>
      {{#if this.canUpdate}}
        <th class="text-center">
          {{t "general.actions"}}
        </th>
      {{/if}}
    </tr>
  </thead>
  <tbody>
    {{#each this.offeringBlocks as |block|}}
      <tr class="offering-block">
        <td
          class="text-top offering-block-date"
          colspan={{if this.canUpdate "10" "9"}}
          data-test-offering-block-date
        >
          <span class="offering-block-date-dayofweek" data-test-dayofweek>
            {{format-date block.date weekday="long"}}
          </span>
          <span class="offering-block-date-dayofmonth" data-test-dayofmonth>
            {{format-date block.date month="long" day="numeric"}}
          </span>
        </td>
      </tr>
      {{#each block.offeringTimeBlocks as |offeringTimeBlock|}}
        <SessionsGridOfferingTableOfferings
          @offeringTimeBlock={{offeringTimeBlock}}
          @canUpdate={{this.canUpdate}}
          @setHeaderLockedStatus={{@setHeaderLockedStatus}}
        />
      {{/each}}
    {{/each}}
  </tbody>
</table>