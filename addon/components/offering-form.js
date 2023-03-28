import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { hash, map } from 'rsvp';
import moment from 'moment-timezone';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import {
  ArrayNotEmpty,
  Custom,
  IsInt,
  Lte,
  Gte,
  Gt,
  Length,
  IsURL,
  validatable,
} from 'ilios-common/decorators/validation';
import { ValidateIf } from 'class-validator';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

const DEBOUNCE_DELAY = 600;
const DEFAULT_URL_VALUE = 'https://';

@validatable
export default class OfferingForm extends Component {
  @service currentUser;
  @service timezone;
  @service intl;

  @tracked currentTimezone = null;
  @tracked isEditingTimezone = false;
  @tracked timezones = null;
  @tracked startDate = null;
  @tracked endDate = null;
  @Length(1, 255) @tracked room = null;
  @IsURL() @Length(1, 2000) @tracked url = null;
  @ValidateIf((o) => o.args.smallGroupMode)
  @ArrayNotEmpty()
  @tracked
  learnerGroups = [];
  @tracked learners = [];
  @tracked showOfferingCalendar = false;
  @tracked makeRecurring = false;
  @tracked recurringDays = null;
  @ValidateIf((o) => o.makeRecurring)
  @IsInt()
  @Gt(0)
  @tracked
  numberOfWeeks = 1;
  @tracked instructors = [];
  @tracked instructorGroups = [];
  @tracked offeringsToSave = 0;
  @tracked savedOfferings = 0;
  @tracked recurringDayOptions = null;
  @tracked availableInstructorGroups = [];
  @tracked loaded = false;
  @tracked saveProgressPercent;
  @tracked urlChanged = false;
  @tracked learnerGroupsFilter = '';

  constructor() {
    super(...arguments);

    this.currentTimezone = this.timezone.getCurrentTimezone();
    this.timezones = this.timezone.getTimezones();

    this.recurringDayOptions = [
      { day: '0', t: 'general.sunday' },
      { day: '1', t: 'general.monday' },
      { day: '2', t: 'general.tuesday' },
      { day: '3', t: 'general.wednesday' },
      { day: '4', t: 'general.thursday' },
      { day: '5', t: 'general.friday' },
      { day: '6', t: 'general.saturday' },
    ];
  }

  get hasOffering() {
    return !!this.args.offering;
  }

  get defaultStartDate() {
    const today = moment();
    const courseStartDate = this.args.courseStartDate;
    const courseEndDate = this.args.courseEndDate;
    let defaultStartDate = today.clone();
    if (isPresent(courseStartDate) && today.isBefore(courseStartDate)) {
      defaultStartDate = moment(courseStartDate);
    }
    if (isPresent(courseEndDate) && today.isAfter(courseEndDate)) {
      defaultStartDate = moment(courseEndDate);
    }

    return defaultStartDate.toDate();
  }

  @IsInt()
  @Gte(0)
  @Custom('validateDurationCallback', 'validateDurationMessageCallback')
  get durationHours() {
    const startDate = this.startDate;
    const endDate = this.endDate;

    if (isEmpty(startDate) || isEmpty(endDate)) {
      return 1;
    }
    const mStart = moment(startDate);
    const mEnd = moment(endDate);
    return mEnd.diff(mStart, 'hours');
  }

  @IsInt()
  @Gte(0)
  @Lte(59)
  @Custom('validateDurationCallback', 'validateDurationMessageCallback')
  get durationMinutes() {
    const startDate = this.startDate;
    const endDate = this.endDate;

    if (isEmpty(startDate) || isEmpty(endDate)) {
      return 0;
    }
    const mStart = moment(startDate);
    const mEnd = moment(endDate);

    const endHour = mEnd.hour();
    const endMinute = mEnd.minute();

    mStart.hour(endHour);
    const startMinute = mStart.minute();

    let diff = 0;
    if (endMinute > startMinute) {
      diff = endMinute - startMinute;
    } else if (endMinute < startMinute) {
      diff = 60 - startMinute + endMinute;
    }
    return diff;
  }

  get formattedCurrentTimezone() {
    return this.timezone.formatTimezone(this.currentTimezone);
  }

  get bestUrl() {
    if (this.url || this.urlChanged) {
      return this.url;
    }

    return DEFAULT_URL_VALUE;
  }

  load = restartableTask(async (element, [offering, cohorts]) => {
    await this.loadData.perform(offering, cohorts);
    await timeout(1);
  });

  loadData = restartableTask(async (offering, cohorts) => {
    this.availableInstructorGroups = await this.loadAvailableInstructorGroups(cohorts);

    if (isPresent(offering)) {
      await this.loadAttrsFromOffering.perform(offering);
    } else {
      this.loadDefaultAttrs();
    }
  });

  @action
  async addLearnerGroup(learnerGroup, cascade) {
    if (cascade) {
      const descendants = await learnerGroup.getAllDescendants();
      this.learnerGroups = uniqueValues([...this.learnerGroups, ...descendants, learnerGroup]);
    } else {
      this.learnerGroups = uniqueValues([...this.learnerGroups, learnerGroup]);
    }
  }

  @action
  async removeLearnerGroup(learnerGroup, cascade) {
    let groupsToRemove = [learnerGroup];
    if (cascade) {
      const descendants = await learnerGroup.getAllDescendants();
      groupsToRemove = [...descendants, learnerGroup];
    }
    this.learnerGroups = uniqueValues(
      this.learnerGroups.filter((g) => !groupsToRemove.includes(g))
    );
  }

  @action
  async addLearner(learner) {
    this.learners = [...this.learners, learner];
  }

  @action
  async removeLearner(learner) {
    const id = learner.get('id');
    this.learners = this.learners.filter((l) => l.get('id') !== id);
  }

  @action
  toggleRecurringDay(day) {
    if (this.recurringDays.includes(day)) {
      this.recurringDays = this.recurringDays.filter((d) => d !== day);
    } else {
      this.recurringDays = [...this.recurringDays, day];
    }
  }

  @action
  addInstructor(user) {
    this.instructors = [...this.instructors, user];
  }

  @action
  addInstructorGroup(group) {
    this.instructorGroups = [...this.instructorGroups, group];
  }

  @action
  removeInstructor(user) {
    this.instructors = this.instructors.filter((u) => u !== user);
  }

  @action
  removeInstructorGroup(group) {
    this.instructorGroups = this.instructorGroups.filter((g) => g !== group);
  }

  @action
  updateStartTime(value, type) {
    const startDate = moment(this.startDate);

    if (type === 'hour') {
      startDate.hour(value);
    } else {
      startDate.minute(value);
    }
    const minutes = this.durationMinutes;
    const hours = this.durationHours;
    const endDate = startDate.clone().add(hours, 'hours').add(minutes, 'minutes');

    this.startDate = startDate.toDate();
    this.endDate = endDate.toDate();
  }

  @action
  updateStartDate(date) {
    const minutes = this.durationMinutes;
    const hours = this.durationHours;
    const currentStartDate = moment(this.startDate);
    const startDate = moment(date)
      .hour(currentStartDate.hour())
      .minute(currentStartDate.minute())
      .toDate();
    const endDate = moment(startDate).add(hours, 'hours').add(minutes, 'minutes').toDate();

    this.startDate = startDate;
    this.endDate = endDate;
  }

  @action
  changeTimezone(event) {
    this.currentTimezone = event.target.value;
    this.isEditingTimezone = false;
  }

  @action
  changeNumberOfWeeks(event) {
    this.numberOfWeeks = event.target.value;
  }

  @action
  changeRoom(event) {
    this.room = event.target.value;
  }

  @action
  changeURL(value) {
    value = value.trim();
    const regex = RegExp('https://http[s]?:');
    if (regex.test(value)) {
      value = value.substring(8);
    }
    this.url = value;
    this.urlChanged = true;
  }

  @action
  selectAllText({ target }) {
    if (target.value === DEFAULT_URL_VALUE) {
      target.select();
    }
  }

  async loadAvailableInstructorGroups(cohorts) {
    let associatedSchools;
    if (isEmpty(cohorts)) {
      associatedSchools = [];
    } else {
      const cohortSchools = await map(cohorts.slice(), (cohort) => cohort.school);
      associatedSchools = uniqueValues(cohortSchools);
    }
    const allInstructorGroups = await map(associatedSchools, (school) => school.instructorGroups);
    return allInstructorGroups.reduce((flattened, arr) => {
      return [...flattened, ...arr.slice()];
    }, []);
  }

  loadDefaultAttrs() {
    if (this.loaded) {
      return;
    }
    this.startDate = moment(this.defaultStartDate).hour(8).minute(0).second(0).toDate();
    this.endDate = moment(this.defaultStartDate).hour(9).minute(0).second(0).toDate();
    this.learnerGroups = [];
    this.learners = [];
    this.recurringDays = [];
    this.instructors = [];
    this.instructorGroups = [];
    this.loaded = true;
  }

  loadAttrsFromOffering = dropTask(async (offering) => {
    if (this.loaded) {
      return;
    }
    this.startDate = offering.get('startDate');
    this.endDate = offering.get('endDate');
    this.room = offering.get('room');
    this.url = offering.get('url');
    this.recurringDays = [];
    const obj = await hash({
      learnerGroups: offering.get('learnerGroups'),
      learners: offering.get('learners'),
      instructors: offering.get('instructors'),
      instructorGroups: offering.get('instructorGroups'),
    });
    this.learnerGroups = obj.learnerGroups.slice();
    this.learners = obj.learners.slice();
    this.instructors = obj.instructors.slice();
    this.instructorGroups = obj.instructorGroups.slice();
    this.loaded = true;
  });

  saveOnEnter = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.saveOffering.perform();
    }
  });

  saveOffering = dropTask(async () => {
    this.addErrorDisplaysFor([
      'room',
      'url',
      'numberOfWeeks',
      'durationHours',
      'durationMinutes',
      'learnerGroups',
    ]);

    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.saveProgressPercent = 1;
    await timeout(1);
    let offerings = await this.makeRecurringOfferingObjects();
    offerings = await this.makeSmallGroupOfferingObjects(offerings);

    // adjust timezone
    offerings.forEach((offering) => {
      offering.startDate = moment
        .tz(moment(offering.startDate).format('Y-MM-DD HH:mm:ss'), this.currentTimezone)
        .toDate();
      offering.endDate = moment
        .tz(moment(offering.endDate).format('Y-MM-DD HH:mm:ss'), this.currentTimezone)
        .toDate();
    });

    const totalOfferings = offerings.length;
    let savedOfferings = 0;
    //save offerings in sets of 5
    let parts;
    while (offerings.length > 0) {
      parts = offerings.splice(0, 5);
      await map(
        parts,
        ({
          startDate,
          endDate,
          room,
          url,
          learnerGroups,
          learners,
          instructorGroups,
          instructors,
        }) => {
          return this.args.save(
            startDate,
            endDate,
            room,
            url,
            learnerGroups,
            learners,
            instructorGroups,
            instructors
          );
        }
      );
      savedOfferings = savedOfferings + parts.length;
      this.saveProgressPercent = Math.floor((savedOfferings / totalOfferings) * 100);
    }
    this.saveProgressPercent = 100;
    await timeout(500);
    this.clearErrorDisplay();
    this.args.close();
  });

  async makeRecurringOfferingObjects() {
    const makeRecurring = this.makeRecurring;
    const offerings = [];
    offerings.push({
      startDate: this.startDate,
      endDate: this.endDate,
      room: this.room,
      url: this.url,
      learnerGroups: this.learnerGroups,
      learners: this.learners,
      instructorGroups: this.instructorGroups,
      instructors: this.instructors,
    });
    if (!makeRecurring) {
      return offerings;
    }

    const userPickedDay = moment(this.startDate).day();
    //convert strings to numbers use parseFloat because parseInt takes a second
    //argument and gets thrown off by map sending that argument as the counter
    const recurringDayInts = this.recurringDays.map(parseFloat).sort();

    // Add offerings for the rest of first week
    //only days AFTER the initial day are considered
    recurringDayInts.forEach((day) => {
      if (day > userPickedDay) {
        const obj = {
          room: this.room,
          url: this.url,
          learnerGroups: this.learnerGroups,
          learners: this.learners,
          instructorGroups: this.instructorGroups,
          instructors: this.instructors,
        };
        obj.startDate = moment(this.startDate).day(day).toDate();
        obj.endDate = moment(this.endDate).day(day).toDate();

        offerings.push(obj);
      }
    });
    recurringDayInts.push(userPickedDay);
    recurringDayInts.sort();

    for (let i = 1; i < this.numberOfWeeks; i++) {
      recurringDayInts.forEach((day) => {
        const obj = {
          room: this.room,
          url: this.url,
          learnerGroups: this.learnerGroups,
          learners: this.learners,
          instructorGroups: this.instructorGroups,
          instructors: this.instructors,
        };
        obj.startDate = moment(this.startDate).day(day).add(i, 'weeks').toDate();
        obj.endDate = moment(this.endDate).day(day).add(i, 'weeks').toDate();

        offerings.push(obj);
      });
    }
    return offerings;
  }

  async makeSmallGroupOfferingObjects(offerings) {
    const smallGroupMode = this.args.smallGroupMode;
    if (!smallGroupMode) {
      return offerings;
    }

    const smallGroupOfferings = [];

    for (let i = 0; i < offerings.length; i++) {
      const { startDate, endDate, learnerGroups, learners } = offerings[i];
      let { room } = offerings[i];
      for (let j = 0; j < learnerGroups.length; j++) {
        const learnerGroup = learnerGroups[j];
        const defaultLocation = learnerGroup.get('location');
        if (isPresent(defaultLocation)) {
          room = defaultLocation;
        }
        const instructors = (await learnerGroup.instructors).slice();
        const instructorGroups = (await learnerGroup.instructorGroups).slice();
        const offering = {
          startDate,
          endDate,
          room,
          url: learnerGroup.url,
          instructorGroups,
          instructors,
          learners,
        };
        offering.learnerGroups = [learnerGroup];

        smallGroupOfferings.push(offering);
      }
    }

    return smallGroupOfferings;
  }

  updateDurationHours = restartableTask(async (hours) => {
    await timeout(DEBOUNCE_DELAY);
    this.addErrorDisplayFor('durationHours');
    this.addErrorDisplayFor('durationMinutes');
    const minutes = this.durationMinutes;
    this.endDate = moment(this.startDate)
      .clone()
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .toDate();
  });

  updateDurationMinutes = restartableTask(async (minutes) => {
    await timeout(DEBOUNCE_DELAY);
    this.addErrorDisplayFor('durationHours');
    this.addErrorDisplayFor('durationMinutes');
    const hours = this.durationHours;
    this.endDate = moment(this.startDate)
      .clone()
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .toDate();
  });

  @action
  sortLearnergroupsByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('locale');
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, {
      numeric: true,
    });
  }

  @action
  validateDurationCallback() {
    const hrs = parseInt(this.durationHours, 10) || 0;
    const mins = parseInt(this.durationMinutes, 10) || 0;
    return !!(hrs + mins);
  }

  @action
  validateDurationMessageCallback() {
    return this.intl.t('errors.greaterThanOrEqualTo', {
      gte: '0',
      description: this.intl.t('general.duration'),
    });
  }
}
