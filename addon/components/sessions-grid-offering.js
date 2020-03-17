import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { timeout } from 'ember-concurrency';
import { restartableTask, dropTask } from 'ember-concurrency-decorators';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import scrollIntoView from 'scroll-into-view';

@validatable
export default class SessionsGridOffering extends Component {
  @Length(1, 255) @NotBlank() @tracked room;
  @tracked isEditing = false;
  @tracked wasUpdated = false;

  @action
  revertRoomChanges(){
    this.room = this.args.offering.room;
  }

  @action
  close() {
    this.isEditing = false;
    scrollIntoView(this.row);
  }

  @dropTask
  *changeRoom(){
    yield timeout(10);
    this.addErrorDisplayFor('room');
    const isValid = yield this.isValid('room');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('room');
    this.args.offering.set('room', this.room);
    yield this.args.offering.save();
  }

  @dropTask
  *save(startDate, endDate, room, learnerGroups, learners, instructorGroups, instructors){
    this.args.offering.setProperties({startDate, endDate, room, learnerGroups, learners, instructorGroups, instructors});
    yield this.args.offering.save();
    this.updateUi.perform();
  }

  @restartableTask
  *updateUi(){
    yield timeout(10);
    this.wasUpdated = true;
    scrollIntoView(this.element);
    yield timeout(4000);
    this.wasUpdated = false;
  }
}
