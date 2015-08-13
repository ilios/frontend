import Ember from 'ember';
import config from 'ilios/config/environment';
import EventMixin from 'ilios/mixins/events';
import ajax from 'ic-ajax';

export default Ember.Service.extend(EventMixin, {
  store: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  slugType: 'S',
  getEvents(schoolId, from, to){
    var deferred = Ember.RSVP.defer();
    var url = '/' + config.adapterNamespace + '/schoolevents/' +
    schoolId + '?from=' + from + '&to=' + to;
    ajax(url).then(data => {
      let events = data.events.sortBy('startDate').map(event => {
        event.slug = this.getSlugForEvent(event);
        
        return event;
      });
      
      deferred.resolve(events);
    });

    return deferred.promise;
  }
});
