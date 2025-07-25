import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { DateTime } from 'luxon';
import { guidFor } from '@ember/object/internals';
import colorChange from 'ilios-common/utils/color-change';
import calendarEventTooltip from 'ilios-common/utils/calendar-event-tooltip';
import { on } from '@ember/modifier';
import noop from 'ilios-common/helpers/noop';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import formatDate from 'ember-intl/helpers/format-date';
import Color from 'color';

export default class IliosCalendarEventMonthComponent extends Component {
  @service intl;

  get eventButtonId() {
    return `ilios-calendar-event-month-button-${guidFor(this)}`;
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

  get style() {
    const { color } = this.args.event;
    const darkcolor = colorChange(color, -0.15);

    const isLight = Color(color).isLight();
    const textColor = isLight ? '--black' : '--white';

    return new htmlSafe(
      `background-color: ${color};
       color: var(${textColor});
       border-left: 4px solid ${darkcolor};`,
    );
  }

  get recentlyUpdated() {
    const lastModifiedDate = DateTime.fromISO(this.args.event.lastModified);
    const today = DateTime.now();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days').days;

    return daysSinceLastUpdate < 6 ? true : false;
  }

  @action
  click() {
    if (this.clickable) {
      this.args.selectEvent();
    }
  }
  <template>
    <button
      {{! template-lint-disable no-inline-styles }}
      style={{this.style}}
      class="month-event {{if this.clickable 'clickable'}}"
      type="button"
      data-test-ilios-calendar-event
      data-test-ilios-calendar-event-month
      {{on "click" (if this.clickable @selectEvent (noop))}}
      id={{this.eventButtonId}}
      {{mouseHoverToggle (set this "showTooltip")}}
    >
      {{#if @event}}
        {{#if this.showTooltip}}
          <IliosTooltip @target={{this.eventButtonElement}}>
            {{this.tooltipContent}}
          </IliosTooltip>
        {{/if}}
        {{#if this.recentlyUpdated}}
          <FaIcon
            @icon="exclamation"
            class="recently-updated-icon"
            @title={{t "general.newUpdates"}}
          />
        {{/if}}
        <span class="ilios-calendar-event-time">
          <span class="ilios-calendar-event-start">
            {{formatDate @event.startDate hour12=true hour="2-digit" minute="2-digit"}}
          </span>
          <span class="ilios-calendar-event-end">
            -
            {{formatDate @event.endDate hour12=true hour="2-digit" minute="2-digit"}}
          </span>
        </span>
        {{#unless @event.isMulti}}
          <span class="ilios-calendar-event-location">
            {{@event.location}}:
          </span>
        {{/unless}}
        <span class="ilios-calendar-event-name">
          {{#if @event.isMulti}}
            {{@event.name}},
            <em>
              {{t "general.multiple"}}
            </em>
          {{else}}
            {{@event.name}}
          {{/if}}
        </span>
      {{/if}}
    </button>
  </template>
}
