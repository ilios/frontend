import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faExclamation } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import Color from 'color';
import formatDate from 'ember-intl/helpers/format-date';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';
import { DateTime } from 'luxon';

import noop from '../helpers/noop';
import mouseHoverToggle from '../modifiers/mouse-hover-toggle';
import colorChange from '../utils/color-change';
import IliosTooltip from './ilios-tooltip';

export default class IliosCalendarEventMonthComponent extends Component {
  @service calendarEventTooltip;

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
    return this.calendarEventTooltip.create(this.args.event, 'h:mma');
  }

  get style() {
    const { color } = this.args.event;
    const darkcolor = colorChange(color, -0.15);

    const isLight = Color(color).isLight();
    const textColor = isLight ? '--black' : '--white';

    return new htmlSafe(
      `background-color: ${color}; color: var(${textColor}); border-left: 4px solid ${darkcolor};`,
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
      class="month-event{{if this.clickable ' clickable'}}"
      {{! template-lint-disable no-inline-styles }}
      style={{this.style}}
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
            @icon={{faExclamation}}
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
