import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class NewSessionComponent extends Component {
  @service store;

  @NotBlank() @Length(3, 200) @tracked title;
  @tracked selectedSessionTypeId;
  @tracked activeSessionTypes;

  @action
  load(element, [sessionTypes]) {
    if (!sessionTypes) {
      return;
    }

    this.activeSessionTypes = sessionTypes.filterBy('active', true);
  }

  get selectedSessionType() {
    let selectedSessionType;

    if (this.selectedSessionTypeId) {
      selectedSessionType = this.args.sessionTypes.find(sessionType => {
        return Number(sessionType.id) === this.selectedSessionTypeId;
      });
    }

    if (!selectedSessionType) {
      // try and default to a type names 'Lecture';
      selectedSessionType = this.args.sessionTypes.findBy('title', 'Lecture');
    }

    if (!selectedSessionType) {
      selectedSessionType = this.args.sessionTypes.firstObject;
    }

    return selectedSessionType;
  }

  @dropTask
  *saveNewSession() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    const session = this.store.createRecord('session', {
      title: this.title,
      sessionType: this.selectedSessionType
    });
    yield this.args.save(session);
    this.args.cancel();
  }

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.get('saveNewSession').perform();
      return;
    }

    if(27 === keyCode) {
      this.cancel();
    }
  }

  @action
  changeSelectedSessionTypeId(event) {
    this.selectedSessionTypeId = Number(event.target.value);
  }
}
