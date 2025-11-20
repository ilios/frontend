import EventsBase from 'ilios-common/classes/events-base';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { sortBy } from 'ilios-common/utils/array-helpers';
import Event from 'ilios-common/classes/event';

export default class UserEvents extends EventsBase {
  @service store;
  @service currentUser;
  @service session;
  @service fetch;
  @service iliosConfig;

  /**
   * Retrieves a list of user-events for the current user that occur in a given date range, sorted by start dates.
   * @method getEvents
   * @param {int} from
   * @param {int} to
   * @return {Promise.<Array>}
   */
  async getEvents(from, to) {
    const user = await this.currentUser.getModel();
    if (!user) {
      return [];
    }

    let url = '';
    const namespace = this.iliosConfig.apiNameSpace;
    if (namespace) {
      url += '/' + namespace;
    }
    url += '/userevents/' + user.get('id') + '?from=' + from + '&to=' + to;

    const data = await this.fetch.getJsonFromApiHost(url);

    return sortBy(
      data.userEvents.map((obj) => new Event(obj, true)),
      ['startDate', 'name'],
    );
  }

  /**
   * Retrieves and event by its given slug.
   * @method getEventForSlug
   * @param {String} slug
   * @return {Promise.<Object>}
   */
  async getEventForSlug(slug) {
    const from = DateTime.fromFormat(slug.substring(1, 9), 'yyyyMMdd').set({ hour: 0 });
    const to = from.set({ hour: 24 });
    const type = slug.substring(9, 10);
    const id = parseInt(slug.substring(10), 10);

    const events = await this.getEvents(from.toUnixInteger(), to.toUnixInteger());

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
