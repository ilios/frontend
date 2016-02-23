import Ember from 'ember';
import EventMixin from 'ilios/mixins/events';

const { inject, computed } = Ember;
const { service } = inject;

export default Ember.Service.extend(EventMixin, {
  ajax: service(),

  config: computed(function(){
    var url = '/application/config';
    const ajax = this.get('ajax');
    return ajax.request(url);
  }),

  itemFromConfig(key){
    return this.get('config').then(config => {
      return config.config[key];
    });
  },

  userSearchType: computed('config.userSearchType', function(){
    return this.itemFromConfig('userSearchType');
  })
});
