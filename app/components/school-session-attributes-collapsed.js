import Ember from 'ember';

const { Component, computed, isEmpty } = Ember;

export default Component.extend({
  school: null,
  tagName: 'section',
  classNames: ['school-session-attributes-collapsed'],
  configs: computed('school.configurations.[]', async function(){
    const school = this.get('school');
    if (isEmpty(school)) {
      return [];
    }
    return await school.get('configurations');
  }),
  async getConfigValue(key){
    const configs = await this.get('configs');
    const config = configs.findBy('key', key);
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
});
