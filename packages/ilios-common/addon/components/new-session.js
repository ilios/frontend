import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { findBy } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class NewSessionComponent extends Component {
  @service store;

  @tracked title;
  @tracked selectedSessionTypeId;

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  get activeSessionTypes() {
    return this.args.sessionTypes.filter((sessionType) => sessionType.active);
  }

  get selectedSessionType() {
    let selectedSessionType;

    if (this.selectedSessionTypeId) {
      selectedSessionType = this.args.sessionTypes.find((sessionType) => {
        return Number(sessionType.id) === this.selectedSessionTypeId;
      });
    }

    if (!selectedSessionType) {
      // try and default to a type names 'Lecture';
      selectedSessionType = findBy(this.args.sessionTypes, 'title', 'Lecture');
    }

    if (!selectedSessionType) {
      selectedSessionType = this.args.sessionTypes[0];
    }

    return selectedSessionType;
  }

  saveNewSession = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    if (!(await this.validations.isValid())) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const session = this.store.createRecord('session', {
      title: this.title,
      sessionType: this.selectedSessionType,
    });
    await this.args.save(session);
    this.args.cancel();
  });

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.saveNewSession.perform();
      return;
    }

    if (27 === keyCode) {
      this.cancel();
    }
  }

  @action
  changeSelectedSessionTypeId(event) {
    this.selectedSessionTypeId = Number(event.target.value);
  }

  @action
  changeTitle(event) {
    this.title = event.target.value;
  }
}
