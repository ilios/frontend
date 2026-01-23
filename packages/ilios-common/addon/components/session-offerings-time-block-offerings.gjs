import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { map } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { sortBy } from 'ilios-common/utils/array-helpers';
import OfferingManager from 'ilios-common/components/offering-manager';

export default class SessionOfferingsTimeBlockOfferingsComponent extends Component {
  @cached
  get sortedOfferingsData() {
    return new TrackedAsyncData(this.sortOfferings(this.args.offeringTimeBlock));
  }

  get sortedOfferings() {
    return this.sortedOfferingsData.isResolved ? this.sortedOfferingsData.value : [];
  }

  async sortOfferings(offeringTimeBlock) {
    const sortProxies = await map(offeringTimeBlock.offerings, async (offering) => {
      const learnerGroups = await offering.learnerGroups;
      return {
        title: learnerGroups.length ? learnerGroups.slice()[0].title : null,
        offering,
      };
    });
    return sortBy(sortProxies, 'title').map((proxy) => proxy.offering);
  }
  <template>
    <div
      class="session-offerings-time-block-offerings"
      data-test-session-offerings-time-block-offerings
    >
      {{#each this.sortedOfferings as |offering|}}
        <OfferingManager
          @offering={{offering}}
          @remove={{@removeOffering}}
          @editable={{@editable}}
          @toggleIsEditing={{@toggleIsEditing}}
        />
      {{/each}}
    </div>
  </template>
}
