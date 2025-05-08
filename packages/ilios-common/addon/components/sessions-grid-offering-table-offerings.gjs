import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { map } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class SessionsGridOfferingTableOfferingsComponent extends Component {
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
}

{{#each this.sortedOfferings as |offering index|}}
  <SessionsGridOffering
    @offering={{offering}}
    @canUpdate={{@canUpdate}}
    @firstRow={{eq index 0}}
    @even={{eq (mod index 2) 1}}
    @span={{this.sortedOfferings.length}}
    @startTime={{format-date @offeringTimeBlock.startDate hour="2-digit" minute="2-digit"}}
    @durationHours={{@offeringTimeBlock.durationHours}}
    @durationMinutes={{@offeringTimeBlock.durationMinutes}}
    @setHeaderLockedStatus={{@setHeaderLockedStatus}}
  />
{{/each}}