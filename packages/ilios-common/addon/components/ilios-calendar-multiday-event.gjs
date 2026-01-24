import Component from '@glimmer/component';
import { action } from '@ember/object';
import not from 'ember-truth-helpers/helpers/not';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import formatDate from 'ember-intl/helpers/format-date';
import t from 'ember-intl/helpers/t';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faBlackTie } from '@fortawesome/free-brands-svg-icons';
import { faCalendarCheck, faCalendarMinus, faFlask } from '@fortawesome/free-solid-svg-icons';

export default class IliosCalendarMultidayEventComponent extends Component {
  get isIlm() {
    return !!this.args.event.ilmSession;
  }
  get isOffering() {
    return !!this.args.event.offering;
  }
  get clickable() {
    return this.isIlm || this.isOffering;
  }

  get enabled() {
    return this.clickable && this.args.isEventSelectable;
  }

  @action
  selectEvent(selectedEvent) {
    if (this.enabled) {
      this.args.selectEvent(selectedEvent);
    }
  }
  <template>
    <li data-test-ilios-calendar-multiday-event>
      <button
        type="button"
        class="link-button"
        disabled={{not this.enabled}}
        {{on "click" (fn this.selectEvent @event)}}
      >
        {{formatDate
          @event.startDate
          month="2-digit"
          day="2-digit"
          year="2-digit"
          hour="2-digit"
          minute="2-digit"
        }}
        &ndash;
        {{formatDate
          @event.endDate
          month="2-digit"
          day="2-digit"
          year="2-digit"
          hour="2-digit"
          minute="2-digit"
        }}
        <span data-test-event-name>
          {{@event.name}}
        </span>
        {{@event.location}}
      </button>
      <span class="session-attributes" data-test-session-attributes>
        {{#if @event.attireRequired}}
          <FaIcon
            @icon={{faBlackTie}}
            @ariaHidden={{false}}
            @title={{t "general.whitecoatsSlashSpecialAttire"}}
          />
        {{/if}}
        {{#if @event.equipmentRequired}}
          <FaIcon @icon={{faFlask}} @ariaHidden={{false}} @title={{t "general.specialEquipment"}} />
        {{/if}}
        {{#if @event.attendanceRequired}}
          <FaIcon
            @icon={{faCalendarCheck}}
            @ariaHidden={{false}}
            @title={{t "general.attendanceIsRequired"}}
          />
        {{/if}}
        {{#if @event.supplemental}}
          <FaIcon
            @icon={{faCalendarMinus}}
            @ariaHidden={{false}}
            @title={{t "general.supplementalCurriculum"}}
          />
        {{/if}}
      </span>
    </li>
  </template>
}
