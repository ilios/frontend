import Component from '@ember/component';
import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: 'section',
  classNames: ['school-session-attributes-expanded'],
  showSessionAttendanceRequired: false,
  showSessionSupplemental: false,
  showSessionSpecialAttireRequired: false,
  showSessionSpecialEquipmentRequired: false,
  isManaging: false,
  didReceiveAttrs(){
    this._super(...arguments);
    const isManaging = this.get('isManaging');
    if (isManaging) {
      const showSessionAttendanceRequired = this.get('showSessionAttendanceRequired');
      const showSessionSupplemental = this.get('showSessionSupplemental');
      const showSessionSpecialAttireRequired = this.get('showSessionSpecialAttireRequired');
      const showSessionSpecialEquipmentRequired = this.get('showSessionSpecialEquipmentRequired');

      this.set('bufferedShowSessionAttendanceRequired', showSessionAttendanceRequired);
      this.set('bufferedShowSessionSupplemental', showSessionSupplemental);
      this.set('bufferedShowSessionSpecialAttireRequired', showSessionSpecialAttireRequired);
      this.set('bufferedShowSessionSpecialEquipmentRequired', showSessionSpecialEquipmentRequired);
    }
  },
  bufferedShowSessionAttendanceRequired: false,
  bufferedShowSessionSupplemental: false,
  bufferedShowSessionSpecialAttireRequired: false,
  bufferedShowSessionSpecialEquipmentRequired: false,
  save: task(function * (){
    const bufferedShowSessionAttendanceRequired = this.get('bufferedShowSessionAttendanceRequired');
    const bufferedShowSessionSupplemental = this.get('bufferedShowSessionSupplemental');
    const bufferedShowSessionSpecialAttireRequired = this.get('bufferedShowSessionSpecialAttireRequired');
    const bufferedShowSessionSpecialEquipmentRequired = this.get('bufferedShowSessionSpecialEquipmentRequired');

    const showSessionAttendanceRequired = isEmpty(bufferedShowSessionAttendanceRequired)?false:bufferedShowSessionAttendanceRequired;
    const showSessionSupplemental = isEmpty(bufferedShowSessionSupplemental)?false:bufferedShowSessionSupplemental;
    const showSessionSpecialAttireRequired = isEmpty(bufferedShowSessionSpecialAttireRequired)?false:bufferedShowSessionSpecialAttireRequired;
    const showSessionSpecialEquipmentRequired = isEmpty(bufferedShowSessionSpecialEquipmentRequired)?false:bufferedShowSessionSpecialEquipmentRequired;

    const values = EmberObject.create({
      showSessionAttendanceRequired,
      showSessionSupplemental,
      showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired
    });

    yield this.get('saveAll')(values);
  }),
  actions: {
    cancel(){
      this.get('manage')(false);
      this.set('bufferedShowSessionAttendanceRequired', false);
      this.set('bufferedShowSessionSupplemental', false);
      this.set('bufferedShowSessionSpecialAttireRequired', false);
      this.set('bufferedShowSessionSpecialEquipmentRequired', false);
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
