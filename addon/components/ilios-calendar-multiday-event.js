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

  @action
  selectEvent(selectedEvent) {
    if (this.clickable && this.args.isEventSelectable) {
      this.args.selectEvent(selectedEvent);
    }
  }
}
