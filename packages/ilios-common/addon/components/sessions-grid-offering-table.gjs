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
