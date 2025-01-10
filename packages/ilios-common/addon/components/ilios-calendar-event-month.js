import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { DateTime } from 'luxon';
import { guidFor } from '@ember/object/internals';
import colorChange from 'ilios-common/utils/color-change';
import calendarEventTooltip from 'ilios-common/utils/calendar-event-tooltip';

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

    return new htmlSafe(
      `background-color: ${color};
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
}
