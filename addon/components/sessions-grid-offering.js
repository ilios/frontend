import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask, dropTask, timeout } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import scrollIntoView from 'scroll-into-view';
import ResolveAsyncValue from '../classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

@validatable
export default class SessionsGridOffering extends Component {
  @Length(1, 255) @NotBlank() @tracked room;
  @tracked isEditing = false;
  @tracked wasUpdated = false;
  @use session = new ResolveAsyncValue(() => [this.args.offering.session]);
  @use course = new ResolveAsyncValue(() => [this.session?.course]);
  @use cohorts = new ResolveAsyncValue(() => [this.args.course?.cohorts]);

  @action
  revertRoomChanges() {
    this.room = this.args.offering.room;
  }

  @action
  close() {
    this.isEditing = false;
    scrollIntoView(this.row);
  }

  changeRoom = dropTask(async () => {
    await timeout(10);
    this.addErrorDisplayFor('room');
    const isValid = await this.isValid('room');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('room');
    this.args.offering.set('room', this.room);
    await this.args.offering.save();
  });

  save = dropTask(
    this,
    async (
      startDate,
      endDate,
      room,
      url,
      learnerGroups,
      learners,
      instructorGroups,
      instructors
    ) => {
      this.args.offering.setProperties({
        startDate,
        endDate,
        room,
        url,
        learnerGroups,
        learners,
        instructorGroups,
        instructors,
      });
      await this.args.offering.save();
      this.updateUi.perform();
    }
  );

  updateUi = restartableTask(async () => {
    await timeout(10);
    this.wasUpdated = true;
    scrollIntoView(this.element);
    await timeout(4000);
    this.wasUpdated = false;
  });
}
