import Ember from 'ember';

const { inject, computed } = Ember;
const { service } = inject;

export default Ember.Service.extend({
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
  }),

  authenticationType: computed('config.type', function(){
    return this.itemFromConfig('type');
  }),

  maxUploadSize: computed('config.maxUploadSize', function(){
    return this.itemFromConfig('maxUploadSize');
  }),

  apiVersion: computed('config.apiVersion', function(){
    return this.itemFromConfig('apiVersion');
  })
});
