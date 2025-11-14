import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import colorChange from 'ilios-common/utils/color-change';
import { htmlSafe } from '@ember/template';
import calendarEventTooltip from 'ilios-common/utils/calendar-event-tooltip';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
import noop from 'ilios-common/helpers/noop';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';
import formatDate from 'ember-intl/helpers/format-date';
import Color from 'color';

export default class WeeklyCalendarEventComponent extends Component {
  @service intl;

  get eventButtonId() {
    return `weekly-calendar-event-button-${guidFor(this)}`;
  }

  get eventButtonElement() {
    return document.getElementById(this.eventButtonId);
  }

  get minutes() {
    const allMinutesInDay = Array(60 * 24).fill(0);
    this.args.allDayEvents.forEach(({ calendarStartDate, calendarEndDate }) => {
      const start = this.getMinuteInTheDay(DateTime.fromISO(calendarStartDate));
      const end = this.getMinuteInTheDay(DateTime.fromISO(calendarEndDate));
      for (let i = start; i <= end; i++) {
        allMinutesInDay[i - 1]++;
      }
    });

    return allMinutesInDay;
  }

  get startDateTime() {
    return DateTime.fromISO(this.args.event.calendarStartDate);
  }

  get endDateTime() {
    return DateTime.fromISO(this.args.event.calendarEndDate);
  }

  get startDate() {
    return this.startDateTime.toJSDate();
  }

  get endDate() {
    return this.endDateTime.toJSDate();
  }

  get lastModifiedDateTime() {
    return DateTime.fromISO(this.args.event.lastModified);
  }

  get isIlm() {
    return !!this.args.event.ilmSession;
  }

  get isOffering() {
    return !!this.args.event.offering;
  }

  get clickable() {
    return this.isIlm || this.isOffering;
  }

  get tooltipContent() {
    return calendarEventTooltip(this.args.event, this.intl, 'h:mma');
  }

  get recentlyUpdated() {
    const today = DateTime.now();
    const { days } = today.diff(this.lastModifiedDateTime, 'days');

    return days < 6;
  }

  get startOfDay() {
    return this.startDateTime.startOf('day');
  }

  get startMinuteRounded() {
    const minute = this.startDateTime.diff(this.startOfDay, 'minutes').minutes;
    return Math.ceil(minute / 5);
  }

  get totalMinutesRounded() {
    const minutes = this.endDateTime.diff(this.startDateTime, 'minutes').minutes;
    return Math.floor(minutes / 5);
  }

  getMinuteInTheDay(dt) {
    const midnight = dt.startOf('day');
    return dt.diff(midnight, 'minutes').minutes;
  }

  get span() {
    const start = this.getMinuteInTheDay(this.startDateTime);
    const end = this.getMinuteInTheDay(this.endDateTime);

    const minutes = this.minutes.slice(start, end - 1);
    const max = Math.max(...minutes);

    return Math.floor(50 / max);
  }

  get style() {
    const { color } = this.args.event;
    const darkcolor = colorChange(color, -0.15);

    const isLight = Color(color).isLight();
    const textColor = isLight ? '--black' : '--white';

    return new htmlSafe(
      `background-color: ${color};
       border-left: .25rem solid ${darkcolor};
       color: var(${textColor});
       grid-column-start: span ${this.span};
       grid-row-start: ${this.startMinuteRounded + 1};
       grid-row-end: span ${this.totalMinutesRounded};`,
    );
  }
  <template>
    <button
      {{! template-lint-disable no-inline-styles }}
      style={{this.style}}
      class="weekly-calendar-event day-{{@day}}
        {{if this.isIlm 'ilm'}}
        {{if this.clickable 'clickable'}}"
      type="button"
      {{on "click" (if this.clickable @selectEvent (noop))}}
      id={{this.eventButtonId}}
      {{mouseHoverToggle (set this "showTooltip")}}
      data-test-calendar-event
      data-test-weekly-calendar-event
    >
      {{#if this.showTooltip}}
        <IliosTooltip @target={{this.eventButtonElement}} data-test-ilios-calendar-event-tooltip>
          {{this.tooltipContent}}
        </IliosTooltip>
      {{/if}}
      <span class="ilios-calendar-event-icons">
        {{#if this.recentlyUpdated}}
          <FaIcon
            @icon="circle-exclamation"
            @title={{t "general.newUpdates"}}
            class="recently-updated-icon"
            data-test-recently-updated-icon
          />
        {{/if}}
        {{#if (not @event.isPublished)}}
          <FaIcon @icon="file-signature" @title={{t "general.notPublished"}} data-test-draft-icon />
        {{else if @event.isScheduled}}
          <FaIcon @icon="clock" @title={{t "general.scheduled"}} data-test-scheduled-icon />
        {{/if}}
      </span>
      <span data-test-title>
        <span class="ilios-calendar-event-time" data-test-time>
          {{#if this.isIlm}}
            <span class="ilios-calendar-event-start">
              {{t "general.ilmDue"}}:
              {{formatDate this.startDate hour12=true hour="2-digit" minute="2-digit"}}
            </span>
          {{else}}
            <span class="ilios-calendar-event-start">
              {{formatDate this.startDate hour12=true hour="2-digit" minute="2-digit"}}
            </span>
          {{/if}}
        </span>
        {{#unless @event.isMulti}}
          <span class="ilios-calendar-event-location">
            {{#if @event.location.length}}
              {{@event.location}}:
            {{/if}}
          </span>
        {{/unless}}
        <span class="ilios-calendar-event-name" data-test-name>
          {{#if @event.isMulti}}
            {{@event.name}},
            <em>
              {{t "general.multiple"}}
            </em>
          {{else}}
            {{@event.name}}
          {{/if}}
        </span>
      </span>
    </button>
  </template>
}
