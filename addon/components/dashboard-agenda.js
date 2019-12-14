import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';
import moment from 'moment';

export default class DashboardAgendaComponent extends Component {
  @service userEvents;

  @tracked areEventsSelectable = true;
  @tracked daysInAdvance = 60;
  @tracked sixDaysAgo = moment().hour(0).minute(0).subtract(6, 'days');
  @tracked weeksEvents = null;

  @restartableTask
  *load() {
    const from = moment().hour(0).minute(0).unix();
    const to = moment().hour(23).minute(59).add(this.daysInAdvance, 'days').unix();

    this.weeksEvents = yield this.userEvents.getEvents(from, to);
  }

  get ilmPreWorkEvents() {
    const preWork = this.weeksEvents.reduce((arr, eventObject) => {
      return arr.pushObjects(eventObject.prerequisites);
    }, []);

    preWork.filter(ev => ev.ilmSession);

    const hashes = [];
    const uniques = [];
    preWork.forEach(event => {
      const hash = moment(event.startDate).format() +
        moment(event.endDate).format() +
        event.name;
      if (! hashes.includes(hash)) {
        hashes.push(hash);
        uniques.pushObject(event);
      }
    });
    return uniques;
  }

  get nonIlmPreWorkEvents() {
    return this.weeksEvents.filter(ev => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }
}
