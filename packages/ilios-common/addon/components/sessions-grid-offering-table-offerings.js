import Component from '@glimmer/component';
import AsyncProcess from 'ilios-common/classes/async-process';
import { use } from 'ember-could-get-used-to-this';
import { map } from 'rsvp';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class SessionsGridOfferingTableOfferingsComponent extends Component {
  @use sortedOfferingsResource = new AsyncProcess(() => [
    this.sortOfferings.bind(this),
    this.args.offeringTimeBlock,
  ]);

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

  get sortedOfferings() {
    if (!this.sortedOfferingsResource) {
      return [];
    }
    return this.sortedOfferingsResource;
  }
}
