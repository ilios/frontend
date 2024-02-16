import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { capitalize } from '@ember/string';

export default class SchoolSessionAttributesExpandedComponent extends Component {
  @tracked flippedShowSessionAttendanceRequired = false;
  @tracked flippedShowSessionSpecialAttireRequired = false;
  @tracked flippedShowSessionSpecialEquipmentRequired = false;
  @tracked flippedShowSessionSupplemental = false;

  get showSessionAttendanceRequired() {
    if (this.flippedShowSessionAttendanceRequired) {
      return !this.args.showSessionAttendanceRequired;
    }
    return this.args.showSessionAttendanceRequired;
  }

  get showSessionSpecialAttireRequired() {
    if (this.flippedShowSessionSpecialAttireRequired) {
      return !this.args.showSessionSpecialAttireRequired;
    }
    return this.args.showSessionSpecialAttireRequired;
  }

  get showSessionSpecialEquipmentRequired() {
    if (this.flippedShowSessionSpecialEquipmentRequired) {
      return !this.args.showSessionSpecialEquipmentRequired;
    }
    return this.args.showSessionSpecialEquipmentRequired;
  }

  get showSessionSupplemental() {
    if (this.flippedShowSessionSupplemental) {
      return !this.args.showSessionSupplemental;
    }
    return this.args.showSessionSupplemental;
  }

  resetFlipped() {
    this.flippedShowSessionAttendanceRequired = false;
    this.flippedShowSessionSupplemental = false;
    this.flippedShowSessionSpecialAttireRequired = false;
    this.flippedShowSessionSpecialEquipmentRequired = false;
  }

  @action
  cancel() {
    this.args.manage(false);
    this.resetFlipped();
  }

  @action
  enableSessionAttributeConfig(name) {
    const bufferName = 'flipped' + capitalize(name);
    this[bufferName] = !this.args[name];
  }

  @action
  disableSessionAttributeConfig(name) {
    const bufferName = 'flipped' + capitalize(name);
    this[bufferName] = this.args[name];
  }

  save = dropTask(async () => {
    await this.args.saveAll({
      showSessionAttendanceRequired: this.showSessionAttendanceRequired,
      showSessionSupplemental: this.showSessionSupplemental,
      showSessionSpecialAttireRequired: this.showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired: this.showSessionSpecialEquipmentRequired,
    });
    this.resetFlipped();
  });
}
