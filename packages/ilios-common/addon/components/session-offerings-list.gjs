import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import OfferingDateBlock from 'ilios-common/utils/offering-date-block';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class SessionOfferingsListComponent extends Component {
  @service store;

  @cached
  get offeringsData() {
    return new TrackedAsyncData(this.args.session.offerings);
  }

  get offerings() {
    return this.offeringsData.isResolved ? this.offeringsData.value : [];
  }

  get offeringBlocks() {
    const dateBlocks = {};
    this.offerings.forEach((offering) => {
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

  @action
  removeOffering(offering) {
    offering.deleteRecord();
    offering.save();
  }
}
