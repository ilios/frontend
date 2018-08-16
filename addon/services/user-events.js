import Service, { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import EventMixin from 'ilios-common/mixins/events';
import moment from 'moment';


export default Service.extend(EventMixin, {
  store: service(),
  currentUser: service(),
  session: service(),
  commonAjax: service(),
  iliosConfig: service(),
  namespace: reads('iliosConfig.apiNameSpace'),

  /**
   * Retrieves a list of user-events for the current user that occur in a given date range, sorted by start dates.
   * @method getEvents
   * @param {int} from
   * @param {int} to
   * @return {Promise.<Array>}
   */
  async getEvents(from, to){
    const user = await this.get('currentUser.model');
    if (! user) {
      return [];
    }

    let url = '';
    const namespace = this.get('namespace');
    if (namespace) {
      url += '/' + namespace;
    }
    url += '/userevents/' + user.get('id') + '?from=' + from + '&to=' + to;

    const commonAjax = this.get('commonAjax');
    const data = await commonAjax.request(url);

    return data.userEvents.map(event => {
      event.isBlanked = !event.offering && !event.ilmSession;
      event.slug = this.getSlugForEvent(event);
      return event;
    }).sortBy('startDate', 'name');
  },

  /**
   * Retrieves and event by it's given slug.
   * @method getEventForSlug
   * @param {String} slug
   * @return {Promise.<Object>}
   */
  async getEventForSlug(slug){
    const from = moment(slug.substring(1, 9), 'YYYYMMDD').hour(0);
    const to = from.clone().hour(24);
    const type = slug.substring(9, 10);
    const id = parseInt(slug.substring(10), 10);

    const events = await this.getEvents(from.unix(), to.unix());

    return events.find(event => {
      if(type === 'O'){
        return parseInt(event.offering, 10) === id;
      }
      if(type === 'I'){
        return parseInt(event.ilmSession, 10) === id;
      }
    });
  },

  /**
   * Generates a slug for a given event.
   * @method getSlugForEvent
   * @param {Object} event
   * @return {String}
   */
  getSlugForEvent(event){
    let slug = 'U';
    slug += moment(event.startDate).format('YYYYMMDD');
    if(event.offering){
      slug += 'O' + event.offering;
    }
    if(event.ilmSession){
      slug += 'I' + event.ilmSession;
    }
    return slug;
  },
});
