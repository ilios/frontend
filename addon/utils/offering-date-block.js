import moment from 'moment';
import { sortBy } from './array-helpers';

class OfferingBlock {
  offerings = [];

  addOffering(offering) {
    this.offerings = [...this.offerings, offering];
  }
}

class OfferingDateBlock extends OfferingBlock {
  dateKey = null;

  constructor(dateKey) {
    super();
    this.dateKey = dateKey;
  }

  //convert our day of the year key into a date at midnight
  get date() {
    const year = this.dateKey.substring(0, 4);
    const dayOfYear = this.dateKey.substring(4);
    const date = new Date(year, 0);
    return new Date(date.setDate(dayOfYear));
  }

  get dateStamp() {
    return moment(this.date).format('X');
  }

  get dayOfWeek() {
    return moment(this.date).format('dddd');
  }

  get dayOfMonth() {
    return moment(this.date).format('MMMM Do');
  }

  get offeringTimeBlocks() {
    const offeringGroups = {};
    this.offerings.forEach(function (offering) {
      const key = offering.get('timeKey');
      if (!(key in offeringGroups)) {
        offeringGroups[key] = new OfferingTimeBlock(key);
      }
      offeringGroups[key].addOffering(offering);
    });
    //convert indexed object to array
    const offeringGroupArray = [];
    let key;
    for (key in offeringGroups) {
      offeringGroupArray.push(offeringGroups[key]);
    }

    return sortBy(offeringGroupArray, 'timeKey');
  }
}

class OfferingTimeBlock extends OfferingBlock {
  sortOfferingsBy = 'learnerGroups.firstObject.title';
  timeKey = null;

  constructor(timeKey) {
    super();
    this.timeKey = timeKey;
  }

  get isMultiDay() {
    return this.startDate.format('DDDDYYYY') !== this.endDate.format('DDDDYYYY');
  }

  //pull our times out of the key
  get startDate() {
    const key = this.timeKey.substring(0, 11);
    return moment(key, 'YYYYDDDHHmm');
  }

  get endDate() {
    const key = this.timeKey.substring(11);
    return moment(key, 'YYYYDDDHHmm');
  }

  get startTime() {
    return moment(this.startDate).format('LT');
  }

  get endTime() {
    return moment(this.endDate).format('LT');
  }

  get longStartText() {
    return moment(this.startDate).format('dddd MMMM D [@] LT');
  }

  get longEndText() {
    return moment(this.endDate).format('dddd MMMM D [@] LT');
  }

  get sortedOfferings() {
    // @todo implement [ST 2023/05/01]
    // return sortBy(this.offerings, this.sortOfferingsBy)
    return this.offerings;
  }

  get durationHours() {
    return Math.floor(this.totalMinutes / 60);
  }

  get durationMinutes() {
    return this.totalMinutes % 60;
  }

  get totalMinutes() {
    const startDate = this.startDate;
    const endDate = this.endDate;
    const diff = endDate.diff(startDate);
    return moment.duration(diff).as('minutes');
  }
}

export default OfferingDateBlock;
