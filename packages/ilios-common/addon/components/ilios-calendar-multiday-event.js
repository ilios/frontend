import Component from '@glimmer/component';
import { action } from '@ember/object';

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
}
