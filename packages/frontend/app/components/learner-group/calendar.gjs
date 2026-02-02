import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { all, map } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import set from 'ember-set-helper/helpers/set';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import not from 'ember-truth-helpers/helpers/not';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import IliosCalendarWeek from 'ilios-common/components/ilios-calendar-week';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import Event from 'ilios-common/classes/event';
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';

export default class LearnerGroupCalendarComponent extends Component {
  @service localeDays;
  @tracked selectedDate = DateTime.now();
  @tracked showSubgroupEvents = false;

  @cached
  get eventsData() {
    return new TrackedAsyncData(this.loadEvents(this.args.learnerGroup, this.showSubgroupEvents));
  }

  get events() {
    if (this.eventsData.isResolved) {
      return this.eventsData.value.filter((ev) => {
        const startDate = DateTime.fromISO(ev.startDate).toJSDate();
        return this.firstDayOfWeek <= startDate && this.lastDayOfWeek >= startDate;
      });
    }
    return [];
  }

  get date() {
    return this.selectedDate.toJSDate();
  }

  get firstDayOfWeek() {
    return this.localeDays.firstDayOfDateWeek(this.date);
  }

  get lastDayOfWeek() {
    return this.localeDays.lastDayOfDateWeek(this.date);
  }

  async loadEvents(learnerGroup, showSubgroupEvents) {
    let learnerGroupOfferings = await this.getEventsFromLearnerGroups([learnerGroup], false);
    if (showSubgroupEvents) {
      const subLearnerGroups = await learnerGroup.get('allDescendants');
      const subLearnerGroupOfferings = await this.getEventsFromLearnerGroups(
        subLearnerGroups,
        true,
      );
      learnerGroupOfferings = [...learnerGroupOfferings, ...subLearnerGroupOfferings];
    }
    return learnerGroupOfferings;
  }

  async getEventsFromLearnerGroups(learnerGroups, showAsBlockedTime) {
    const offerings = await all(mapBy(learnerGroups, 'offerings'));
    const flat = offerings.reduce((flattened, obj) => {
      return [...flattened, ...obj];
    }, []);
    return await map(flat, async (offering) => {
      const session = await offering.session;
      const sessionType = await session.sessionType;
      const course = await session.course;
      const school = await course.school;
      const instructors = await offering.getAllInstructors();
      const instructorNames = instructors.map((instructor) => instructor.fullName);

      return new Event(
        {
          startDate: offering.startDate.toISOString(),
          endDate: offering.endDate.toISOString(),
          lastModified: offering.updatedAt.toISOString(),
          courseTitle: course.title,
          name: session.title,
          offering: offering.id,
          location: offering.room,
          school: school.id,
          color: sessionType.calendarColor,
          prerequisites: [],
          postrequisites: [],
          isScheduled: session.isScheduled || course.isScheduled,
          isPublished: session.isPublished && course.isPublished,
          sessionTypeTitle: sessionType.title,
          instructors: instructorNames,
        },
        false,
        showAsBlockedTime,
      );
    });
  }

  @action
  goForward() {
    this.selectedDate = DateTime.fromISO(this.selectedDate).plus({ weeks: 1 });
  }
  @action
  goBack() {
    this.selectedDate = DateTime.fromISO(this.selectedDate).minus({ weeks: 1 });
  }
  @action
  gotoToday() {
    this.selectedDate = DateTime.now();
  }
  <template>
    <div class="learner-group-calendar" data-test-learner-group-calendar>
      <p class="learner-group-calendar-filter-options">
        <span class="filter" data-test-learner-group-calendar-toggle-subgroup-events>
          <ToggleYesno @yes={{this.showSubgroupEvents}} @toggle={{set this "showSubgroupEvents"}} />
          <label {{on "click" (fn (set this "showSubgroupEvents") (not this.showSubgroupEvents))}}>
            {{t "general.showSubgroupEvents"}}
          </label>
        </span>
      </p>
      <ul class="inline learner-group-calendar-time-picker">
        <li>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.forward"}}
            {{on "click" this.goBack}}
            data-test-go-back
          >
            <FaIcon @icon={{faBackward}} />
          </button>
        </li>
        <li>
          <button
            class="link-button"
            type="button"
            {{on "click" this.gotoToday}}
            data-test-go-today
          >
            {{t "general.today"}}
          </button>
        </li>
        <li>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.forward"}}
            {{on "click" this.goForward}}
            data-test-go-forward
          >
            <FaIcon @icon={{faForward}} />
          </button>
        </li>
      </ul>
      <div class="ilios-calendar">
        <IliosCalendarWeek
          @calendarEvents={{this.events}}
          @date={{this.date}}
          @areEventsSelectable={{false}}
          @areDaysSelectable={{false}}
        />
      </div>
      <span class="loading-indicator {{unless this.load.isRunning 'loaded'}}">
        <LoadingSpinner />
        {{t "general.loadingEvents"}}
        ...
      </span>
    </div>
  </template>
}
