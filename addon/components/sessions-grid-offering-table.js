import Component from '@ember/component';
import { computed } from '@ember/object';
import OfferingDateBlock from 'ilios-common/utils/offering-date-block';

export default Component.extend({
  tagName: 'table',
  classNames: ['sessions-grid-offering-table'],
  'data-test-sessions-grid-offering-table': true,
  offeringBlocks: computed('offerings.@each.{startDate,endDate,room,learnerGroups,instructorGroups}', function() {
    const offerings = this.get('offerings');
    if (!offerings) {
      return [];
    }
    const dateBlocks = {};
    offerings.forEach(offering => {
      const key = offering.get('dateKey');
      if (!(key in dateBlocks)) {
        dateBlocks[key] = OfferingDateBlock.create({
          dateKey: key
        });
      }
      dateBlocks[key].addOffering(offering);
    });
    //convert indexed object to array
    const dateBlockArray = [];
    let key;
    for (key in dateBlocks) {
      dateBlockArray.pushObject(dateBlocks[key]);
    }
    return dateBlockArray.sortBy('dateStamp');
  }),
});
