import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { filter, hash, map } from 'rsvp';
import moment from 'moment';
import { timeout } from 'ember-concurrency';
import {dropTask, restartableTask, task} from "ember-concurrency-decorators";
import { ArrayNotEmpty, IsInt, Lte, Gte, Gt, NotBlank, Length, validatable } from 'ilios-common/decorators/validation';
import { ValidateIf } from "class-validator";
import scrollIntoView from "scroll-into-view";

const DEBOUNCE_DELAY = 600;

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
  @NotBlank() @Length(1, 255) @tracked room = 'TBD';
  @ValidateIf(o => o.args.smallGroupMode) @ArrayNotEmpty() @tracked learnerGroups = [];
  @tracked learners = [];
  @tracked showOfferingCalendar = false;
  @tracked makeRecurring = false;
  @tracked recurringDays = null;
  @ValidateIf(o => o.makeRecurring) @IsInt() @Gt(0) @tracked numberOfWeeks = 1;
  @tracked instructors = null;
  @tracked instructorGroups = null;
  @tracked offeringsToSave = 0;
  @tracked savedOfferings = 0;
  @tracked recurringDayOptions = null;
  @tracked availableInstructorGroups = [];
  @tracked loaded = false;

  constructor() {
    super(...arguments);

    this.currentTimezone = this.timezone.getCurrentTimezone();
    this.timezones = this.timezone.getTimezones();

    this.recurringDayOptions = [
      {day: '0', t: 'general.sunday'},
      {day: '1', t: 'general.monday'},
      {day: '2', t: 'general.tuesday'},
      {day: '3', t: 'general.wednesday'},
      {day: '4', t: 'general.thursday'},
      {day: '5', t: 'general.friday'},
      {day: '6', t: 'general.saturday'},
    ];
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

  @IsInt() @Gte(0)
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

  @IsInt() @Gte(0) @Lte(59)
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
      diff = (60 - startMinute) + endMinute;
    }
    return diff;
  }

  get formattedCurrentTimezone() {
    return this.timezone.formatTimezone(this.currentTimezone);
  }

  @restartableTask
  * load(element, [offering, cohorts, scrollToBottom]) {
    yield this.loadData.perform(offering, cohorts);
    yield timeout(1);
    if (scrollToBottom) {
      scrollIntoView(this.scrollTo);
    }
  }

  @restartableTask()
  *loadData(offering, cohorts) {
    this.availableInstructorGroups = yield this.loadAvailableInstructorGroups(cohorts);

    if (isPresent(offering)) {
      yield this.loadAttrsFromOffering.perform(offering);
    } else {
      this.loadDefaultAttrs();
    }
  }

  @action
  async addLearnerGroup(learnerGroup) {
    const descendants = await learnerGroup.get('allDescendants');
    this.learnerGroups = [...this.learnerGroups, ...descendants, learnerGroup];
  }

  @action
  async removeLearnerGroup(learnerGroup) {
    const descendants = await learnerGroup.get('allDescendants');
    const groupsToRemove = [...descendants, learnerGroup];
    this.learnerGroups = this.learnerGroups.filter(g => !groupsToRemove.includes(g));
  }

  @action
  async addLearner(learner) {
    this.learners = [...this.learners, learner];
  }

  @action
  async removeLearner(learner) {
    const id = learner.get('id');
    this.learners = this.learners.filter(l => l.get('id') !== id);
  }

  @action
  toggleRecurringDay(day) {
    if (this.recurringDays.includes(day)) {
      this.recurringDays = this.recurringDays.filter(d => d !== day);
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
    this.instructors = this.instructors.filter(u => u !== user);
  }

  @action
  removeInstructorGroup(group) {
    this.instructorGroups = this.instructorGroups.filter(g => g !== group);
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
    const startDate = moment(date).hour(currentStartDate.hour()).minute(currentStartDate.minute()).toDate();
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

  async loadAvailableInstructorGroups(cohorts) {
    let associatedSchools;
    if (isEmpty(cohorts)) {
      associatedSchools = [];
    } else {
      const cohortSchools = await map(cohorts.toArray(), cohort => {
        return cohort.get('school');
      });
      const schools = [];
      schools.pushObjects(cohortSchools);
      associatedSchools = schools.uniq().toArray();
    }
    const allInstructorGroups = await map(associatedSchools, school => {
      return school.get('instructorGroups');
    });
    return allInstructorGroups.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);
  }

  async lowestLearnerGroupLeaves(learnerGroups) {
    const ids = learnerGroups.mapBy('id');
    return filter(learnerGroups, async group => {
      const children = await group.get('allDescendants');
      const selectedChildren = children.filter(child => ids.includes(child.get('id')));
      return selectedChildren.length === 0;
    });
  }

  loadDefaultAttrs() {
    if (this.loaded) {
      return;
    }
    this.startDate = moment(this.defaultStartDate).hour(8).minute(0).second(0).toDate();
    this.endDate = moment(this.defaultStartDate).hour(9).minute(0).second(0).toDate();
    this.room = 'TBD';
    this.learnerGroups = [];
    this.learners = [];
    this.recurringDays = [];
    this.instructors = [];
    this.instructorGroups = [];
    this.loaded = true;
  }

  @dropTask
  * loadAttrsFromOffering(offering) {
    if (this.loaded) {
      return;
    }
    this.startDate = offering.get('startDate');
    this.endDate = offering.get('endDate');
    this.room = offering.get('room');
    this.recurringDays = [];
    const obj = yield hash({
      learnerGroups: offering.get('learnerGroups'),
      learners: offering.get('learners'),
      instructors: offering.get('instructors'),
      instructorGroups: offering.get('instructorGroups'),
    });
    this.learnerGroups = obj.learnerGroups.toArray();
    this.learners = obj.learners.toArray();
    this.instructors = obj.instructors.toArray();
    this.instructorGroups = obj.instructorGroups.toArray();
    this.loaded = true;
  }

  @task
  * saveOffering() {
    this.offeringsToSave = 0;
    this.savedOfferings = 0;
    this.addErrorDisplaysFor(['room', 'numberOfWeeks', 'durationHours', 'durationMinutes', 'learnerGroups']);

    yield timeout(10);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    let offerings = yield this.makeRecurringOfferingObjects.perform();
    offerings = yield this.makeSmallGroupOfferingObjects.perform(offerings);

    // adjust timezone
    offerings.forEach(offering => {
      offering.startDate = moment.tz(
        moment(offering.startDate).format('Y-MM-DD HH:mm:ss'), this.currentTimezone).toDate();
      offering.endDate = moment.tz(
        moment(offering.endDate).format('Y-MM-DD HH:mm:ss'), this.currentTimezone).toDate();
    });

    this.offeringsToSave = offerings.length;
    //save offerings in sets of 5
    let parts;
    while (offerings.length > 0) {
      parts = offerings.splice(0, 5);
      yield map(parts, ({startDate, endDate, room, learnerGroups, learners, instructorGroups, instructors}) => {
        return this.args.save(startDate, endDate, room, learnerGroups, learners, instructorGroups, instructors);
      });
      this.savedOfferings = this.savedOfferings + parts.length;
    }
    this.clearErrorDisplay();
    this.args.close();
  }

  @task
  * makeRecurringOfferingObjects() {
    const makeRecurring = this.makeRecurring;
    const learnerGroups = yield this.lowestLearnerGroupLeaves(this.learnerGroups);
    const offerings = [];
    offerings.push({
      startDate: this.startDate,
      endDate: this.endDate,
      room: this.room,
      learnerGroups,
      learners: this.learners,
      instructorGroups: this.instructorGroups,
      instructors: this.instructors
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
    recurringDayInts.forEach(day => {
      if (day > userPickedDay) {
        const obj = {
          room: this.room,
          learnerGroups,
          instructorGroups: this.instructorGroups,
          instructors: this.instructors
        };
        obj.startDate = moment(this.startDate).day(day).toDate();
        obj.endDate = moment(this.endDate).day(day).toDate();

        offerings.push(obj);
      }
    });
    recurringDayInts.pushObject(userPickedDay);
    recurringDayInts.sort();

    for (let i = 1; i < this.numberOfWeeks; i++) {
      recurringDayInts.forEach(day => {
        const obj = {
          room: this.room,
          learnerGroups,
          instructorGroups: this.instructorGroups,
          instructors: this.instructors
        };
        obj.startDate = moment(this.startDate).day(day).add(i, 'weeks').toDate();
        obj.endDate = moment(this.endDate).day(day).add(i, 'weeks').toDate();

        offerings.push(obj);
      });
    }
    return offerings;
  }

  @task
  * makeSmallGroupOfferingObjects(offerings) {
    const smallGroupMode = this.args.smallGroupMode;
    if (!smallGroupMode) {
      return offerings;
    }

    const smallGroupOfferings = [];

    for (let i = 0; i < offerings.length; i++) {
      const {startDate, endDate, learnerGroups, learners} = offerings[i];
      let {room} = offerings[i];
      for (let j = 0; j < learnerGroups.length; j++) {
        const learnerGroup = learnerGroups[j];
        const defaultLocation = learnerGroup.get('location');
        if (isPresent(defaultLocation)) {
          room = defaultLocation;
        }
        const instructors = yield learnerGroup.get('instructors');
        const instructorGroups = yield learnerGroup.get('instructorGroups');
        const offering = {startDate, endDate, room, instructorGroups, instructors, learners};
        offering.learnerGroups = [learnerGroup];

        smallGroupOfferings.pushObject(offering);
      }
    }

    return smallGroupOfferings;
  }

  @restartableTask
  * validateThenSaveOffering() {
    this.addErrorDisplaysFor(['room', 'numberOfWeeks', 'durationHours', 'durationMinutes', 'learnerGroups']);
    const isValid = yield this.isValid();
    if (!isValid) {
      return;
    }
    yield this.saveOffering.perform();
  }

  @restartableTask
  * updateDurationHours(hours) {
    yield timeout(DEBOUNCE_DELAY);
    this.addErrorDisplayFor('durationHours');
    const minutes = this.durationMinutes;
    this.endDate = moment(this.startDate)
      .clone()
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .toDate();
  }


  @restartableTask
  * updateDurationMinutes(minutes) {
    yield timeout(DEBOUNCE_DELAY);
    this.addErrorDisplayFor('durationMinutes');
    const hours = this.durationHours;
    this.endDate = moment(this.startDate)
      .clone()
      .add(hours, 'hours')
      .add(minutes, 'minutes')
      .toDate();
  }
}
