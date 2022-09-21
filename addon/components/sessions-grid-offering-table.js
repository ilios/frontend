import Component from '@glimmer/component';
import OfferingDateBlock from 'ilios-common/utils/offering-date-block';
import { sortBy } from '../utils/array-helpers';

export default class SessionsGridOfferingTable extends Component {
  get offeringBlocks() {
    if (!this.args.offerings) {
      return [];
    }
    const dateBlocks = {};
    this.args.offerings.forEach((offering) => {
      const key = offering.get('dateKey');
      if (!(key in dateBlocks)) {
        dateBlocks[key] = OfferingDateBlock.create({
          dateKey: key,
        });
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
