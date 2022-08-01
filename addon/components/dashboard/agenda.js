import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { DateTime } from 'luxon';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class DashboardAgendaComponent extends Component {
  @service userEvents;

  @tracked areEventsSelectable = true;
  @tracked daysInAdvance = 60;
  @tracked sixDaysAgo = DateTime.fromObject({
    hour: 0,
    minute: 0,
  }).minus({ days: 6 });

  @use weeksEvents = new ResolveAsyncValue(() => [
    this.userEvents.getEvents(
      DateTime.fromObject({
        hour: 0,
        minute: 0,
        second: 0,
      }).toSeconds(),
      DateTime.fromObject({
        hour: 23,
        minute: 59,
        second: 59,
      })
        .plus({ days: this.daysInAdvance })
        .toSeconds()
    ),
  ]);

  get nonIlmPreWorkEvents() {
    return this.weeksEvents.filter((ev) => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }
}
