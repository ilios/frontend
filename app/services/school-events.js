import Ember from 'ember';
import config from 'ilios/config/environment';
import EventMixin from 'ilios/mixins/events';
import ajax from 'ic-ajax';
import moment from 'moment';

export default Ember.Service.extend(EventMixin, {
  store: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  getEvents(schoolId, from, to){
    var deferred = Ember.RSVP.defer();
    var url = '/' + config.adapterNamespace + '/schoolevents/' +
    schoolId + '?from=' + from + '&to=' + to;
    ajax(url).then(data => {
      let events = data.events.map(event => {
        event.slug = this.getSlugForEvent(event);
        return event;
      }).sortBy('startDate');

      deferred.resolve(events);
    });

    return deferred.promise;
  },
  getEventForSlug(slug){
    let schoolId = parseInt(slug.substring(1, 3));
    let from = moment(slug.substring(3, 11), 'YYYYMMDD').hour(0);
    let to = from.clone().hour(24);
    let type = slug.substring(11, 12);
    let id = parseInt(slug.substring(12));
    return new Ember.RSVP.Promise(resolved => {
      this.getEvents(schoolId, from.unix(), to.unix()).then(events => {
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
    let slug = 'S';
    let schoolId = parseInt(event.school).toString();
    //always use a two digit schoolId
    if(schoolId.length === 1){
      schoolId = '0' + schoolId;
    }
    slug += schoolId;
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
