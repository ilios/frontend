import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { hash, map } from 'rsvp';
import { DateTime } from 'luxon';
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
import { TrackedAsyncData } from 'ember-async-data';

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
  @tracked saveProgressPercent;
  @tracked urlChanged = false;
  @tracked learnerGroupsFilter = '';

  constructor() {
    super(...arguments);

    this.currentTimezone = this.timezone.getCurrentTimezone();
    this.timezones = this.timezone.getTimezones();

    this.recurringDayOptions = [
      { day: 7, t: 'general.sunday' },
      { day: 1, t: 'general.monday' },
      { day: 2, t: 'general.tuesday' },
      { day: 3, t: 'general.wednesday' },
      { day: 4, t: 'general.thursday' },
      { day: 5, t: 'general.friday' },
      { day: 6, t: 'general.saturday' },
    ];
  }

  get hasOffering() {
    return !!this.args.offering;
  }

  get defaultStartDate() {
    const today = DateTime.now();
    const courseStartDate = DateTime.fromJSDate(this.args.courseStartDate);
    const courseEndDate = DateTime.fromJSDate(this.args.courseEndDate);
    if (today < courseStartDate) {
      return courseStartDate.toJSDate();
    } else if (today > courseEndDate) {
      return courseEndDate.toJSDate();
    }
    return today.toJSDate();
  }

  get startDateDayOfWeek() {
    return DateTime.fromJSDate(this.startDate).weekday;
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
    return Math.trunc(
      DateTime.fromJSDate(this.endDate).diff(DateTime.fromJSDate(this.startDate), 'hours').hours,
    );
  }

  @IsInt()
  @Gte(0)
  @Lte(59)
  @Custom('validateDurationCallback', 'validateDurationMessageCallback')
  get durationMinutes() {
    const startDate = this.startDate;
    const endDate = this.endDate;

    if (isEmpty(this.startDate) || isEmpty(this.endDate)) {
      return 0;
    }
    const endDateTime = DateTime.fromJSDate(endDate);
    const startDateTime = DateTime.fromJSDate(startDate).set({ hour: endDateTime.hour });
    const startMinute = startDateTime.minute;
    const endMinute = endDateTime.minute;

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

  @cached
  get offeringFormData() {
    return new TrackedAsyncData(this.loadData(this.args.offering, this.args.cohorts));
  }

  async loadData(offering, cohorts) {
    this.availableInstructorGroups = await this.loadAvailableInstructorGroups(cohorts);

    if (isPresent(offering)) {
      await this.loadAttrsFromOffering.perform(offering);
    } else {
      this.loadDefaultAttrs();
    }
  }

  async loadAvailableInstructorGroups(cohorts) {
    let associatedSchools;
    if (isEmpty(cohorts)) {
      associatedSchools = [];
    } else {
      const cohortSchools = await map(cohorts, async (cohort) => {
        const programYear = await cohort.programYear;
        const program = await programYear.program;
        return program.school;
      });
      associatedSchools = uniqueValues(cohortSchools);
    }
    const allInstructorGroups = await map(associatedSchools, (school) => school.instructorGroups);
    return allInstructorGroups.reduce((flattened, arr) => {
      return [...flattened, ...arr];
    }, []);
  }

  loadDefaultAttrs() {
    this.startDate = DateTime.fromJSDate(this.defaultStartDate)
      .set({ hour: 8, minute: 0, second: 0 })
      .toJSDate();
    this.endDate = DateTime.fromJSDate(this.defaultStartDate)
      .set({ hour: 9, minute: 0, second: 0 })
      .toJSDate();
    this.learnerGroups = [];
    this.learners = [];
    this.recurringDays = [];
    this.instructors = [];
    this.instructorGroups = [];
  }

  loadAttrsFromOffering = dropTask(async (offering) => {
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
    this.learnerGroups = obj.learnerGroups;
    this.learners = obj.learners;
    this.instructors = obj.instructors;
    this.instructorGroups = obj.instructorGroups;
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
      this.learnerGroups.filter((g) => !groupsToRemove.includes(g)),
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
    const newTime = type === 'hour' ? { hour: value } : { minute: value };

    const startDate = DateTime.fromJSDate(this.startDate).set(newTime);

    const minutes = this.durationMinutes;
    const hours = this.durationHours;
    const endDate = startDate.plus({ hour: hours, minute: minutes });

    this.startDate = startDate.toJSDate();
    this.endDate = endDate.toJSDate();
  }

  @action
  updateStartDate(date) {
    const minutes = this.durationMinutes;
    const hours = this.durationHours;
    const currentStartDate = DateTime.fromJSDate(this.startDate);
    const startDate = DateTime.fromJSDate(date).set({
      hour: currentStartDate.hour,
      minute: currentStartDate.minute,
    });
    const endDate = startDate.plus({ hour: hours, minute: minutes });

    this.startDate = startDate.toJSDate();
    this.endDate = endDate.toJSDate();
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
      offering.startDate = DateTime.fromJSDate(offering.startDate)
        .setZone(this.currentTimezone, { keepLocalTime: true })
        .toJSDate();
      offering.endDate = DateTime.fromJSDate(offering.endDate)
        .setZone(this.currentTimezone, { keepLocalTime: true })
        .toJSDate();
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
            instructors,
          );
        },
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

    const userPickedDay = DateTime.fromJSDate(this.startDate).weekday;
    const recurringDays = [...this.recurringDays].sort();

    // Add offerings for the rest of first week
    //only days AFTER the initial day are considered
    recurringDays.forEach((day) => {
      if (day > userPickedDay) {
        const obj = {
          room: this.room,
          url: this.url,
          learnerGroups: this.learnerGroups,
          learners: this.learners,
          instructorGroups: this.instructorGroups,
          instructors: this.instructors,
        };
        obj.startDate = DateTime.fromJSDate(this.startDate).set({ weekday: day }).toJSDate();
        obj.endDate = DateTime.fromJSDate(this.endDate).set({ weekday: day }).toJSDate();

        offerings.push(obj);
      }
    });
    recurringDays.push(userPickedDay);
    recurringDays.sort();

    for (let i = 1; i < this.numberOfWeeks; i++) {
      recurringDays.forEach((day) => {
        const obj = {
          room: this.room,
          url: this.url,
          learnerGroups: this.learnerGroups,
          learners: this.learners,
          instructorGroups: this.instructorGroups,
          instructors: this.instructors,
        };
        obj.startDate = DateTime.fromJSDate(this.startDate)
          .set({ weekday: day })
          .plus({ week: i })
          .toJSDate();
        obj.endDate = DateTime.fromJSDate(this.endDate)
          .set({ weekday: day })
          .plus({ week: i })
          .toJSDate();
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
        const instructors = await learnerGroup.instructors;
        const instructorGroups = await learnerGroup.instructorGroups;
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
    // The corresponding input field passes an empty string if the input blank or invalid.
    // Here, we ignore invalid input and exit early.
    if ('' === hours) {
      return;
    }
    await timeout(DEBOUNCE_DELAY);
    this.addErrorDisplayFor('durationHours');
    this.addErrorDisplayFor('durationMinutes');
    const minutes = this.durationMinutes;
    this.endDate = DateTime.fromJSDate(this.startDate)
      .plus({ hour: hours, minute: minutes })
      .toJSDate();
  });

  updateDurationMinutes = restartableTask(async (minutes) => {
    // The corresponding input field passes an empty string if the input blank or invalid.
    // Here, we ignore invalid input and exit early.
    if ('' === minutes) {
      return;
    }
    await timeout(DEBOUNCE_DELAY);
    this.addErrorDisplayFor('durationHours');
    this.addErrorDisplayFor('durationMinutes');
    const hours = this.durationHours;
    this.endDate = DateTime.fromJSDate(this.startDate)
      .plus({ hour: hours, minute: minutes })
      .toJSDate();
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
