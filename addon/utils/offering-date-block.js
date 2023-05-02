import { DateTime } from 'luxon';
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
    return DateTime.fromJSDate(this.date).toFormat('X');
  }

  get dayOfWeek() {
    return DateTime.fromJSDate(this.date).toFormat('EEEE');
  }

  get dayOfMonth() {
    return DateTime.fromJSDate(this.date).toFormat('MMMM d');
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
  timeKey = null;

  constructor(timeKey) {
    super();
    this.timeKey = timeKey;
  }

  get isMultiDay() {
    return this.startDate.toFormat('oooYYYY') !== this.endDate.toFormat('oooYYYY');
  }

  //pull our times out of the key
  get startDate() {
    const key = this.timeKey.substring(0, 11);
    return DateTime.fromFormat(key, 'yoooHHmm');
  }

  get endDate() {
    const key = this.timeKey.substring(11);
    return DateTime.fromFormat(key, 'yoooHHmm');
  }

  get startTime() {
    return this.startDate.toFormat('t');
  }

  get endTime() {
    return this.endDate.toFormat('t');
  }

  get longStartText() {
    return this.startDate.toFormat('EEEE MMMM d @ t');
  }

  get longEndText() {
    return this.endDate.toFormat('EEEE MMMM d @ t');
  }

  get durationHours() {
    return Math.floor(this.totalMinutes / 60);
  }

  get durationMinutes() {
    return this.totalMinutes % 60;
  }

  get totalMinutes() {
    return this.endDate.diff(this.startDate, 'minutes').minutes;
  }
}

export default OfferingDateBlock;
export { OfferingBlock, OfferingDateBlock, OfferingTimeBlock };
