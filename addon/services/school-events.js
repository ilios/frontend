import EventsBase from 'ilios-common/classes/events-base';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { sortBy } from 'ilios-common/utils/array-helpers';

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
      data.events.map((obj) => this.createEventFromData(obj, false)),
      ['startDate', 'name']
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
    const from = moment(slug.substring(3, 11), 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    const type = slug.substring(11, 12);
    const id = parseInt(slug.substring(12), 10);

    const events = await this.getEvents(schoolId, from.unix(), to.unix());

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
