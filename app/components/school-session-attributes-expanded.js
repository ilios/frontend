import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, RSVP, inject, computed, isEmpty } = Ember;
const { service } = inject;
const { all } = RSVP;

export default Component.extend({
  store: service(),
  school: null,
  classNames: ['school-session-attributes-expanded'],
  bufferedShowSessionAttendanceRequired: null,
  bufferedShowSessionSupplemental: null,
  bufferedShowSessionSpecialAttireRequired: null,
  bufferedShowSessionSpecialEquipmentRequired: null,
  isManaging: false,
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('loadBufferedConfigs').perform();
  },
  configs: computed('school.configurations.[]', async function(){
    const school = this.get('school');
    if (isEmpty(school)) {
      return [];
    }
    return await school.get('configurations');
  }),
  async getConfigValue(name){
    const configs = await this.get('configs');
    const config = configs.findBy('name', name);
    const value = isEmpty(config)?false:config.get('value');

    return Ember.$.parseJSON(value);
  },
  showSessionAttendanceRequired: computed('configs.[]', async function(){
    return await this.getConfigValue('showSessionAttendanceRequired');
  }),
  showSessionSupplemental: computed('configs.[]', async function(){
    return await this.getConfigValue('showSessionSupplemental');
  }),
  showSessionSpecialAttireRequired: computed('configs.[]', async function(){
    return await this.getConfigValue('showSessionSpecialAttireRequired');
  }),
  showSessionSpecialEquipmentRequired: computed('configs.[]', async function(){
    return await this.getConfigValue('showSessionSpecialEquipmentRequired');
  }),
  createSessionAttributeConfig(name){
    const store = this.get('store');
    const school = this.get('school');
    const config = store.createRecord('school-config', {
      school,
      name
    });

    return config;
  },
  save: task(function * (){
    const configs = yield this.get('configs');

    const names = [
      'AttendanceRequired',
      'Supplemental',
      'SpecialAttireRequired',
      'SpecialEquipmentRequired',
    ];
    let toSave = [];
    for (let i = 0; i < names.length; i++) {
      let name = names[i];
      let oldValue = yield this.get(`showSession${name}`);
      let newValue = this.get(`bufferedShowSession${name}`);
      if (oldValue !== newValue) {
        let config = configs.findBy('name', `showSession${name}`);
        if (isEmpty(config)) {
          config = this.createSessionAttributeConfig(`showSession${name}`);
        }
        config.set('value', newValue);
        toSave.pushObject(config);
      }
    }

    yield all(toSave.invoke('save'));
    this.get('setManaging')(false);
  }),
  loadBufferedConfigs: task(function * (){
    const showSessionAttendanceRequired = yield this.get('showSessionAttendanceRequired');
    const showSessionSupplemental = yield this.get('showSessionSupplemental');
    const showSessionSpecialAttireRequired = yield this.get('showSessionSpecialAttireRequired');
    const showSessionSpecialEquipmentRequired = yield this.get('showSessionSpecialEquipmentRequired');

    this.set('bufferedShowSessionAttendanceRequired', showSessionAttendanceRequired);
    this.set('bufferedShowSessionSupplemental', showSessionSupplemental);
    this.set('bufferedShowSessionSpecialAttireRequired', showSessionSpecialAttireRequired);
    this.set('bufferedShowSessionSpecialEquipmentRequired', showSessionSpecialEquipmentRequired);
  }),
  actions: {
    cancel(){
      this.set('bufferedConfigurations', []);
      this.get('setManaging')(false);
    },
    enableSessionAttributeConfig(name){
      const bufferName = 'buffered' + name.capitalize();
      this.set(bufferName, true);
    },
    disableSessionAttributeConfig(name){
      const bufferName = 'buffered' + name.capitalize();
      this.set(bufferName, false);
    },
  }
});
