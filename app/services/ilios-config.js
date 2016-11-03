import Ember from 'ember';

const { inject, computed, isPresent } = Ember;
const { service } = inject;

export default Ember.Service.extend({
  ajax: service(),
  serverVariables: service(),

  config: computed('apiHost', function(){
    const apiHost = this.get('apiHost');
    const url = apiHost + '/application/config';
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
  }),

  apiNameSpace: computed('serverVariables.apiNameSpace', function(){
    const serverVariables = this.get('serverVariables');
    const apiNameSpace = serverVariables.get('apiNameSpace');
    if (isPresent(apiNameSpace)) {
      //remove trailing slashes
      return apiNameSpace.replace(/\/+$/, "");
    }
    return '';
  }),

  apiHost: computed('serverVariables.apiHost', function(){
    const serverVariables = this.get('serverVariables');
    const apiHost = serverVariables.get('apiHost');
    if (isPresent(apiHost)) {
      //remove trailing slashes
      return apiHost.replace(/\/+$/, "");
    }
    return '';
  }),
});
