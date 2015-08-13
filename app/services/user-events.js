import Ember from 'ember';
import config from 'ilios/config/environment';
import EventMixin from 'ilios/mixins/events';
import ajax from 'ic-ajax';

export default Ember.Service.extend(EventMixin, {
  store: Ember.inject.service(),
  currentUser: Ember.inject.service(),
  slugType: 'U',
  getEvents(from, to){
    var deferred = Ember.RSVP.defer();
    this.get('currentUser.model').then(user => {
      if( user ){
        var url = '/' + config.adapterNamespace + '/userevents/' +
        user.get('id') + '?from=' + from + '&to=' + to;
        ajax(url).then(data => {
          let events = data.userEvents.sortBy('startDate').map(event => {
            event.slug = this.getSlugForEvent(event);
            
            return event;
          });
          
          deferred.resolve(events);
        });
      } else {
        deferred.resolve([]);
      }

    });

    return deferred.promise;
  }
});
