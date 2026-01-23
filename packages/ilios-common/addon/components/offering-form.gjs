import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty, isPresent } from '@ember/utils';
import { hash, map } from 'rsvp';
import { DateTime } from 'luxon';
import { mixed, number, string } from 'yup';
import { task, timeout } from 'ember-concurrency';
import { uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueId, fn } from '@ember/helper';
import ToggleButtons from 'ilios-common/components/toggle-buttons';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';
import toggle from 'ilios-common/helpers/toggle';
import OfferingCalendar from 'ilios-common/components/offering-calendar';
import DatePicker from 'ilios-common/components/date-picker';
import TimePicker from 'ilios-common/components/time-picker';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import noop from 'ilios-common/helpers/noop';
import formatDate from 'ember-intl/helpers/format-date';
import isEqual from 'ember-truth-helpers/helpers/is-equal';
import set from 'ember-set-helper/helpers/set';
import FaIcon from 'ilios-common/components/fa-icon';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import or from 'ember-truth-helpers/helpers/or';
import includes from 'ilios-common/helpers/includes';
import eq from 'ember-truth-helpers/helpers/eq';
import pick from 'ilios-common/helpers/pick';
import InstructorSelectionManager from 'ilios-common/components/instructor-selection-manager';
import LearnergroupSelectionManager from 'ilios-common/components/learnergroup-selection-manager';
import LearnerSelectionManager from 'ilios-common/components/learner-selection-manager';
import SaveButton from 'ilios-common/components/save-button';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const DEBOUNCE_DELAY = 600;
const DEFAULT_URL_VALUE = 'https://';

export default class OfferingForm extends Component {
  @service currentUser;
  @service timezone;
  @service intl;

  @tracked currentTimezone = null;
  @tracked isEditingTimezone = false;
  @tracked timezones = null;
  @tracked startDate = null;
  @tracked endDate = null;
  @tracked room = null;
  @tracked url = null;
  @tracked learnerGroups = [];
  @tracked learners = [];
  @tracked showOfferingCalendar = false;
  @tracked makeRecurring = false;
  @tracked recurringDays = null;
  @tracked numberOfWeeks = 1;
  @tracked instructors = [];
  @tracked instructorGroups = [];
  @tracked offeringsToSave = 0;
  @tracked savedOfferings = 0;
  @tracked availableInstructorGroups = [];
  @tracked saveProgressPercent;
  @tracked urlChanged = false;
  @tracked learnerGroupsFilter = '';

  constructor() {
    super(...arguments);

    this.currentTimezone = this.timezone.getCurrentTimezone();
    this.timezones = this.timezone.getTimezones();
  }
  get recurringDayOptions() {
    return [
      { day: 7, label: this.intl.t('general.sunday') },
      { day: 1, label: this.intl.t('general.monday') },
      { day: 2, label: this.intl.t('general.tuesday') },
      { day: 3, label: this.intl.t('general.wednesday') },
      { day: 4, label: this.intl.t('general.thursday') },
      { day: 5, label: this.intl.t('general.friday') },
      { day: 6, label: this.intl.t('general.saturday') },
    ];
  }

  validations = new YupValidations(this, {
    room: string().ensure().trim().max(255),
    url: string().ensure().trim().max(2000).url(),
    numberOfWeeks: number().when('$makeRecurring', {
      is: true,
      then: (schema) => schema.integer().min(1),
    }),
    learnerGroups: mixed().when('$args.smallGroupMode', {
      is: true,
      then: (schema) =>
        schema.test(
          'is-array',
          (d) => {
            return {
              path: d.path,
              messageKey: 'errors.empty',
            };
          },
          (value) => {
            return Array.isArray(value) && !!value.length;
          },
        ),
    }),
    durationHours: number()
      .integer()
      .min(0)
      .test(
        'duration-hours',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.greaterThanOrEqualTo',
            values: {
              gte: '0',
            },
          };
        },
        (value) => {
          return this.hasZeroDuration(value, this.durationMinutes);
        },
      ),
    durationMinutes: number()
      .integer()
      .min(0)
      .max(59)
      .test(
        'duration-minutes',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.greaterThanOrEqualTo',
            values: {
              gte: '0',
            },
          };
        },
        (value) => {
          return this.hasZeroDuration(this.durationHours, value);
        },
      ),
  });

  hasZeroDuration(hours, minutes) {
    const hrs = parseInt(hours, 10) || 0;
    const mins = parseInt(minutes, 10) || 0;
    return !!(hrs + mins);
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

  loadAttrsFromOffering = task({ drop: true }, async (offering) => {
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
    this.validations.addErrorDisplayFor('learnerGroups');
    if (cascade) {
      const descendants = await learnerGroup.getAllDescendants();
      this.learnerGroups = uniqueValues([...this.learnerGroups, ...descendants, learnerGroup]);
    } else {
      this.learnerGroups = uniqueValues([...this.learnerGroups, learnerGroup]);
    }
  }

  @action
  async removeLearnerGroup(learnerGroup, cascade) {
    this.validations.addErrorDisplayFor('learnerGroups');
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
    this.validations.addErrorDisplayFor('numberOfWeeks');
    this.numberOfWeeks = event.target.value;
  }

  @action
  changeRoom(event) {
    this.validations.addErrorDisplayFor('room');
    this.room = event.target.value;
  }

  @action
  changeURL(value) {
    this.validations.addErrorDisplayFor('url');
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

  saveOnEnter = task({ drop: true }, async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.saveOffering.perform();
    }
  });

  saveOffering = task({ drop: true }, async () => {
    this.validations.addErrorDisplaysFor([
      'room',
      'url',
      'numberOfWeeks',
      'learnerGroups',
      'durationHours',
      'durationMinutes',
    ]);
    const isValid = await this.validations.isValid();
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
    this.validations.clearErrorDisplay();
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

  updateDurationHours = task({ restartable: true }, async (hours) => {
    this.validations.addErrorDisplayFor('durationHours');
    // The corresponding input field passes an empty string if the input blank or invalid.
    // Here, we ignore invalid input and exit early.
    if ('' === hours) {
      return;
    }
    await timeout(DEBOUNCE_DELAY);
    this.validations.addErrorDisplayFor('durationHours');
    this.validations.addErrorDisplayFor('durationMinutes');
    const minutes = this.durationMinutes;
    this.endDate = DateTime.fromJSDate(this.startDate)
      .plus({ hour: hours, minute: minutes })
      .toJSDate();
  });

  updateDurationMinutes = task({ restartable: true }, async (minutes) => {
    // The corresponding input field passes an empty string if the input blank or invalid.
    // Here, we ignore invalid input and exit early.
    if ('' === minutes) {
      return;
    }
    await timeout(DEBOUNCE_DELAY);
    this.validations.addErrorDisplayFor('durationHours');
    this.validations.addErrorDisplayFor('durationMinutes');
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
  <template>
    <div class="offering-form" data-test-offering-form>
      {{#if this.offeringFormData.isResolved}}
        {{#let (uniqueId) as |templateId|}}
          <div class="toggle-offering-calendar">
            <ToggleButtons
              @firstLabel={{t "general.hideCalendar"}}
              @firstOptionSelected={{not this.showOfferingCalendar}}
              @secondLabel={{t "general.showCalendar"}}
              @toggle={{toggle "showOfferingCalendar" this}}
            />
          </div>
          {{#if this.showOfferingCalendar}}
            <OfferingCalendar
              @endDate={{this.endDate}}
              @learnerGroups={{this.learnerGroups}}
              @startDate={{this.startDate}}
              @session={{@session}}
            />
          {{/if}}
          <div class="form">
            <fieldset class="scheduling">
              <legend>{{t "general.scheduling"}}</legend>
              <div class="start-date">
                <label>
                  {{t "general.startDate"}}:
                </label>
                <DatePicker @value={{this.startDate}} @onChange={{this.updateStartDate}} />
              </div>
              <div class="start-time">
                <label>
                  {{t "general.startTime"}}:
                </label>
                <TimePicker @date={{this.startDate}} @action={{this.updateStartTime}} />
              </div>
              <div class="offering-duration">
                <label>
                  {{t "general.duration"}}:
                </label>
                <div class="duration-inputs">
                  <div class="hours">
                    <div class="hours-container">
                      <input
                        id="hours-{{templateId}}"
                        min="0"
                        type="number"
                        value={{this.durationHours}}
                        disabled={{this.saveOffering.isRunning}}
                        {{on "input" (perform this.updateDurationHours value="target.value")}}
                        {{on "keypress" (if @offering (perform this.saveOnEnter) (noop))}}
                        {{this.validations.attach "durationHours"}}
                      />
                      <label for="hours-{{templateId}}">
                        {{t "general.hours"}}
                      </label>
                    </div>
                    <YupValidationMessage
                      @description={{t "general.hours"}}
                      @validationErrors={{this.validations.errors.durationHours}}
                      data-test-duration-hours-validation-error-message
                    />
                  </div>
                  <div class="minutes">
                    <div class="minutes-container">
                      <input
                        id="minutes-{{templateId}}"
                        max="59"
                        min="0"
                        type="number"
                        value={{this.durationMinutes}}
                        disabled={{this.saveOffering.isRunning}}
                        {{on "input" (perform this.updateDurationMinutes value="target.value")}}
                        {{on "keypress" (if @offering (perform this.saveOnEnter) (noop))}}
                        {{this.validations.attach "durationMinutes"}}
                      />
                      <label for="minutes-{{templateId}}">
                        {{t "general.minutes"}}
                      </label>
                    </div>
                    <YupValidationMessage
                      @description={{t "general.minutes"}}
                      @validationErrors={{this.validations.errors.durationMinutes}}
                      data-test-duration-minutes-validation-error-message
                    />
                  </div>
                </div>
              </div>
              <div class="end-date-time">
                <label>
                  {{t "general.end"}}:
                </label>
                {{#if this.endDate}}
                  <div class="text">
                    {{formatDate
                      this.endDate
                      month="2-digit"
                      day="2-digit"
                      year="numeric"
                      hour="2-digit"
                      minute="2-digit"
                    }}
                  </div>
                {{/if}}
              </div>
              <div class="timezone" data-test-timezone-picker>
                <label for="timezone-{{templateId}}">
                  {{t "general.timezone"}}:
                </label>
                {{#if this.isEditingTimezone}}
                  <div class="picker">
                    <select id="timezone-{{templateId}}" {{on "change" this.changeTimezone}}>
                      {{#each this.timezones as |timezone|}}
                        <option
                          value={{timezone.value}}
                          selected={{isEqual timezone.value this.currentTimezone}}
                        >
                          {{timezone.label}}
                        </option>
                      {{/each}}
                    </select>
                    <span class="actions">
                      <button
                        class="cancel"
                        title={{t "general.cancel"}}
                        type="button"
                        {{on "click" (set this "isEditingTimezone" false)}}
                      >
                        <FaIcon @icon={{faXmark}} />
                      </button>
                    </span>
                  </div>
                {{else}}
                  <div data-test-current-timezone class="current-timezone">
                    <button
                      class="link-button"
                      type="button"
                      {{on "click" (set this "isEditingTimezone" true)}}
                    >
                      {{this.formattedCurrentTimezone}}
                    </button>
                  </div>
                {{/if}}
              </div>

              {{#if @showMakeRecurring}}
                <div class="make-recurring">
                  <label>
                    {{t "general.makeRecurring"}}:
                  </label>
                  <div>
                    <ToggleYesno
                      @yes={{this.makeRecurring}}
                      @toggle={{set this "makeRecurring" (not this.makeRecurring)}}
                    />
                    {{#if this.makeRecurring}}
                      <div class="make-recurring-options">
                        <div class="make-recurring-days">
                          {{#each this.recurringDayOptions as |obj i|}}
                            <div data-test-make-recurring-day>
                              <input
                                id="make-recurring-day-input-{{i}}-{{templateId}}"
                                type="checkbox"
                                checked={{or
                                  (includes obj.day this.recurringDays)
                                  (eq this.startDateDayOfWeek obj.day)
                                }}
                                disabled={{eq this.startDateDayOfWeek obj.day}}
                                data-test-recurring-day-input={{i}}
                                {{on "click" (fn this.toggleRecurringDay obj.day)}}
                              />
                              <label
                                class="day-of-week clickable"
                                for="make-recurring-day-input-{{i}}-{{templateId}}"
                                data-test-recurring-day-label={{i}}
                              >
                                {{obj.label}}
                              </label>
                            </div>
                          {{/each}}
                        </div>
                        <div class="make-recurring-input-container">
                          <input
                            type="text"
                            id="make-recurring-weeks-{{templateId}}"
                            value={{this.numberOfWeeks}}
                            class="make-recurring-input"
                            {{on "input" this.changeNumberOfWeeks}}
                            {{this.validations.attach "numberOfWeeks"}}
                          />
                          <label
                            class="make-recurring-input-label"
                            for="make-recurring-weeks-{{templateId}}"
                          >
                            {{t "general.weeks"}}
                          </label>
                          <YupValidationMessage
                            @description={{t "general.weeks"}}
                            @validationErrors={{this.validations.errors.numberOfWeeks}}
                            data-test-number-of-weeks-validation-error-message
                          />
                        </div>
                      </div>
                    {{/if}}
                  </div>
                </div>
              {{/if}}
              {{#if @showRoom}}
                <div class="room">
                  <label for="location-{{templateId}}">
                    {{t "general.location"}}:
                    {{#unless @offering}}
                      <span class="label-description">({{t "general.defaultNotLoaded"}})</span>
                    {{/unless}}
                  </label>
                  <input
                    id="location-{{templateId}}"
                    type="text"
                    value={{this.room}}
                    disabled={{this.saveOffering.isRunning}}
                    {{on "input" this.changeRoom}}
                    {{this.validations.attach "room"}}
                    {{on "keypress" (if @offering (perform this.saveOnEnter) (noop))}}
                  />
                  <YupValidationMessage
                    @description={{t "general.location"}}
                    @validationErrors={{this.validations.errors.room}}
                    data-test-room-validation-error-message
                  />
                </div>
                <div class="url" data-test-url>
                  <label for="url-{{templateId}}">
                    {{t "general.virtualLearningLink"}}:
                    {{#unless @offering}}
                      <span class="label-description">({{t "general.defaultNotLoaded"}})</span>
                    {{/unless}}
                  </label>
                  {{! template-lint-disable no-bare-strings}}
                  <input
                    id="url-{{templateId}}"
                    type="text"
                    placeholder="https://example.com"
                    value={{this.bestUrl}}
                    inputmode="url"
                    disabled={{this.saveOffering.isRunning}}
                    {{on "input" (pick "target.value" this.changeURL)}}
                    {{on "focus" this.selectAllText}}
                    {{on "keypress" (if @offering (perform this.saveOnEnter) (noop))}}
                    {{this.validations.attach "url"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.virtualLearningLink"}}
                    @validationErrors={{this.validations.errors.url}}
                    data-test-url-validation-error-message
                  />
                </div>
              {{/if}}
            </fieldset>
            {{#if @showInstructors}}
              <fieldset class="instructor-management" data-test-instructor-management>
                <legend>{{t "general.instructorsAndInstructorGroups"}}</legend>
                <InstructorSelectionManager
                  @addInstructor={{this.addInstructor}}
                  @addInstructorGroup={{this.addInstructorGroup}}
                  @removeInstructor={{this.removeInstructor}}
                  @removeInstructorGroup={{this.removeInstructorGroup}}
                  @availableInstructorGroups={{this.availableInstructorGroups}}
                  @instructorGroups={{this.instructorGroups}}
                  @instructors={{this.instructors}}
                  @showDefaultNotLoaded={{not this.hasOffering}}
                />
              </fieldset>
            {{/if}}
            <fieldset class="learner-management" data-test-learner-management>
              <legend>{{t "general.learnersAndLearnerGroups"}}</legend>
              <LearnergroupSelectionManager
                @learnerGroups={{this.learnerGroups}}
                @cohorts={{@cohorts}}
                @add={{this.addLearnerGroup}}
                @remove={{this.removeLearnerGroup}}
              />
              <YupValidationMessage
                @description={{t "general.learnerGroups"}}
                @validationErrors={{this.validations.errors.learnerGroups}}
                data-test-learner-groups-validation-error-message
              />
              {{#unless @smallGroupMode}}
                <LearnerSelectionManager
                  @learners={{this.learners}}
                  @remove={{this.removeLearner}}
                  @add={{this.addLearner}}
                />
              {{/unless}}
            </fieldset>
            <div class="buttons">
              <SaveButton
                class="done text"
                @isSaving={{this.saveOffering.isRunning}}
                @saveProgressPercent={{this.saveProgressPercent}}
                {{on "click" (perform this.saveOffering)}}
              >
                {{t "general.save"}}
              </SaveButton>
              <button
                class="cancel text"
                type="button"
                disabled={{this.saveOffering.isRunning}}
                {{on "click" @close}}
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        {{/let}}
      {{/if}}
    </div>
  </template>
}
