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

export default class DailyCalendarEventComponent extends Component {
  @service intl;

  constructor() {
    super(...arguments);
    const allMinutesInDay = Array(60 * 24).fill(0);
    this.args.allDayEvents.forEach(({ startDate, endDate }) => {
      const start = this.getMinuteInTheDay(startDate);
      const end = this.getMinuteInTheDay(endDate);
      for (let i = start; i <= end; i++) {
        allMinutesInDay[i - 1]++;
      }
    });

    this.minutes = allMinutesInDay;
  }

  get eventButtonId() {
    return `daily-calendar-event-button-${guidFor(this)}`;
  }

  get eventButtonElement() {
    return document.getElementById(this.eventButtonId);
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
    const lastModifiedDate = DateTime.fromISO(this.args.event.lastModified);
    const today = DateTime.now();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days').days;

    return daysSinceLastUpdate < 6;
  }

  get startLuxon() {
    return DateTime.fromISO(this.args.event.startDate);
  }

  get endLuxon() {
    return DateTime.fromISO(this.args.event.endDate);
  }

  get startOfDayLuxon() {
    return this.startLuxon.startOf('day');
  }

  get startMinuteRounded() {
    const minute = this.startLuxon.diff(this.startOfDayLuxon, 'minutes').minutes;
    return Math.ceil(minute / 5);
  }

  get totalMinutesRounded() {
    const minutes = this.endLuxon.diff(this.startLuxon, 'minutes').minutes;
    return Math.floor(minutes / 5);
  }

  getMinuteInTheDay(date) {
    const dt = DateTime.fromISO(date);
    const midnight = dt.startOf('day');
    return dt.diff(midnight, 'minutes').minutes;
  }

  get span() {
    const start = this.getMinuteInTheDay(this.args.event.startDate);
    const end = this.getMinuteInTheDay(this.args.event.endDate);

    const minutes = this.minutes.slice(start, end - 1);
    const max = Math.max(...minutes);

    return Math.floor(50 / max);
  }

  get style() {
    const { color } = this.args.event;
    const darkcolor = colorChange(color, -0.15);

    return new htmlSafe(
      `background-color: ${color};
       border-left: .25rem solid ${darkcolor};
       grid-column-start: span ${this.span};
       grid-row-start: ${this.startMinuteRounded + 1};
       grid-row-end: span ${this.totalMinutesRounded};`,
    );
  }
  <template>
    <button
      {{! template-lint-disable no-inline-styles }}
      style={{this.style}}
      class="daily-calendar-event {{if this.isIlm 'ilm'}} {{if this.clickable 'clickable'}}"
      type="button"
      {{on "click" (if this.clickable @selectEvent (noop))}}
      id={{this.eventButtonId}}
      {{mouseHoverToggle (set this "showTooltip")}}
      data-test-calendar-event
      data-test-daily-calendar-event
    >
      {{#if this.showTooltip}}
        <IliosTooltip @target={{this.eventButtonElement}}>
          {{this.tooltipContent}}
        </IliosTooltip>
      {{/if}}
      <span class="ilios-calendar-event-icons">
        {{#if this.recentlyUpdated}}
          <FaIcon
            @icon="circle-exclamation"
            class="recently-updated-icon"
            @title={{t "general.newUpdates"}}
            data-test-recently-updated-icon
          />
        {{/if}}
        {{#if (not @event.isPublished)}}
          <FaIcon @icon="file-signature" data-test-draft-icon />
        {{else if @event.isScheduled}}
          <FaIcon @icon="clock" data-test-scheduled-icon />
        {{/if}}
      </span>
      <span class="ilios-calendar-event-time" data-test-time>
        {{#if this.isIlm}}
          <span class="ilios-calendar-event-start">
            {{t "general.ilmDue"}}:
            {{formatDate @event.startDate hour12=true hour="2-digit" minute="2-digit"}}
          </span>
        {{else}}
          <span class="ilios-calendar-event-start">
            {{formatDate @event.startDate hour12=true hour="2-digit" minute="2-digit"}}
          </span>
        {{/if}}
      </span>
      <span class="ilios-calendar-event-location">
        {{#if @event.location.length}}
          {{@event.location}}:
        {{/if}}
      </span>
      <span class="ilios-calendar-event-name" data-test-name>
        {{@event.name}}
      </span>
    </button>
  </template>
}
