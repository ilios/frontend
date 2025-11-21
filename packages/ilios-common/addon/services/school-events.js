import EventsBase from 'ilios-common/classes/events-base';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { sortBy } from 'ilios-common/utils/array-helpers';
import Event from 'ilios-common/classes/event';

export default class SchoolEvents extends EventsBase {
  @service store;
  @service currentUser;
  @service fetch;
  @service iliosConfig;

  /**
   * Retrieves a list of school-events for a given school that occur in a given date range,
   * sorted by start dates.
   * @method getEvents
   * @param {int} schoolId
   * @param {int} from
   * @param {int} to
   * @return {Promise.<Array>}
   */
  async getEvents(schoolId, from, to) {
    let url = '';
    const namespace = this.iliosConfig.apiNameSpace;
    if (namespace) {
      url += '/' + namespace;
    }
    url += '/schoolevents/' + schoolId + '?from=' + from + '&to=' + to;

    const data = await this.fetch.getJsonFromApiHost(url);

    return sortBy(
      data.events.map((obj) => new Event(obj, false)),
      ['startDate', 'name'],
    );
  }

  /**
   * Retrieves and event by it's given slug.
   * @method getEventForSlug
   * @param {String} slug
   * @return {Promise.<Object>}
   */
  async getEventForSlug(slug) {
    const schoolId = parseInt(slug.substring(1, 3), 10);
    const from = DateTime.fromFormat(slug.substring(3, 11), 'yyyyMMdd').set({ hour: 0 });
    const to = from.set({ hour: 24 });
    const type = slug.substring(11, 12);
    const id = parseInt(slug.substring(12), 10);

    const events = await this.getEvents(schoolId, from.toUnixInteger(), to.toUnixInteger());

    return events.find((event) => {
      if (type === 'O') {
        return parseInt(event.offering, 10) === id;
      }
      if (type === 'I') {
        return parseInt(event.ilmSession, 10) === id;
      }
    });
  }
}
