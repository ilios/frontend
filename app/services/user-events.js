import Ember from 'ember';
import EventMixin from 'ilios/mixins/events';
import moment from 'moment';

const { inject, computed } = Ember;
const { service } = inject;
const { reads } = computed;

export default Ember.Service.extend(EventMixin, {
  store: service(),
  currentUser: service(),
  session: service(),
  ajax: service(),
  iliosConfig: service(),

  namespace: reads('iliosConfig.apiNameSpace'),

  async getEvents(from, to){
    const currentUser = this.get('currentUser');
    const user = await currentUser.get('model');

    if (!user) {
      return [];
    }
    const url = '/' + this.get('namespace') + '/userevents/' +
    user.get('id') + '?from=' + from + '&to=' + to;
    const ajax = this.get('ajax');
    const data = await ajax.request(url);
    let events = data.userEvents.map(event => {
      event.isBlanked = !event.offering && !event.ilmSession;
      event.slug = this.getSlugForEvent(event);
      return event;
    }).sortBy('startDate');

    return events;
  },
  getEventForSlug(slug){
    let from = moment(slug.substring(1, 9), 'YYYYMMDD').hour(0);
    let to = from.clone().hour(24);
    let type = slug.substring(9, 10);
    let id = parseInt(slug.substring(10));

    return new Ember.RSVP.Promise(resolved => {
      this.getEvents(from.unix(), to.unix()).then(events => {
        let event = events.find( event => {
          if(type === 'O'){
            return event.offering === id;
          }
          if(type === 'I'){
            return event.ilmSession === id;
          }
        });

        resolved(event);
      });
    });


  },
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
