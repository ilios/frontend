import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';


export default class SchoolSessionAttributesComponent extends Component {
  @service store;

  @tracked showSessionAttendanceRequired;
  @tracked showSessionSupplemental;
  @tracked showSessionSpecialAttireRequired;
  @tracked showSessionSpecialEquipmentRequired;

  @restartableTask
  *load() {
    const {
      showSessionAttendanceRequired,
      showSessionSupplemental,
      showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired,
    } = yield hash({
      showSessionAttendanceRequired: this.args.school.getConfigValue('showSessionAttendanceRequired'),
      showSessionSupplemental: this.args.school.getConfigValue('showSessionSupplemental'),
      showSessionSpecialAttireRequired: this.args.school.getConfigValue('showSessionSpecialAttireRequired'),
      showSessionSpecialEquipmentRequired: this.args.school.getConfigValue('showSessionSpecialEquipmentRequired'),
    });
    this.showSessionAttendanceRequired = showSessionAttendanceRequired;
    this.showSessionSupplemental = showSessionSupplemental;
    this.showSessionSpecialAttireRequired = showSessionSpecialAttireRequired;
    this.showSessionSpecialEquipmentRequired = showSessionSpecialEquipmentRequired;
  }

  @dropTask
  *save(newValues) {
    const names = [
      'showSessionAttendanceRequired',
      'showSessionSupplemental',
      'showSessionSpecialAttireRequired',
      'showSessionSpecialEquipmentRequired',
    ];
    const toSave = [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const config = yield this.args.school.setConfigValue(name, newValues.get(name));
      if (config) {
        toSave.pushObject(config);
      }
    }
    try {
      yield all(toSave.invoke('save'));
      yield this.load.perform();
    } finally {
      this.args.manage(false);
    }
  }
}
