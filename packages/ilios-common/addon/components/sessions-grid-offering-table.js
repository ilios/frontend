import Component from '@glimmer/component';
import { use } from 'ember-could-get-used-to-this';
import PermissionChecker from 'ilios-common/classes/permission-checker';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import OfferingDateBlock from 'ilios-common/utils/offering-date-block';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class SessionsGridOfferingTable extends Component {
  @use canUpdate = new PermissionChecker(() => ['canUpdateSession', this.args.session]);

  @cached
  get offerings() {
    return new TrackedAsyncData(this.args.session.offerings);
  }

  get offeringBlocks() {
    if (!this.offerings.isResolved) {
      return [];
    }
    const dateBlocks = {};
    this.offerings.value.slice().forEach((offering) => {
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
