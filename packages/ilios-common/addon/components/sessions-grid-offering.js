import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask, dropTask, timeout } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import scrollIntoView from 'scroll-into-view';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class SessionsGridOffering extends Component {
  @Length(1, 255) @NotBlank() @tracked room;
  @tracked isEditing = false;
  @tracked wasUpdated = false;

  constructor() {
    super(...arguments);
    this.room = this.args.offering.room;
  }

  @cached
  get sessionData() {
    return new TrackedAsyncData(this.args.offering.session);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.session?.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  @cached
  get learnerGroupsData() {
    return new TrackedAsyncData(this.args.offering.learnerGroups);
  }

  get session() {
    return this.sessionData.isResolved ? this.sessionData.value : null;
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  get learnerGroups() {
    return this.learnerGroupsData.isResolved ? this.learnerGroupsData.value : null;
  }

  get cohortsLoaded() {
    return !!this.cohorts;
  }

  @action
  close({ target }) {
    this.isEditing = false;
    this.args.setHeaderLockedStatus(this.isEditing);
    const row = target.parentElement.parentElement.parentElement.parentElement.parentElement;
    scrollIntoView(row, {
      behavior: 'smooth',
    });
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
      instructors,
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
      this.toggleEditing();
      await this.args.offering.save();
      this.updateUi.perform();
    },
  );

  updateUi = restartableTask(async () => {
    await timeout(10);
    this.wasUpdated = true;
    scrollIntoView(this.element);
    await timeout(4000);
    this.wasUpdated = false;
  });

  toggleEditing = () => {
    this.isEditing = !this.isEditing;
    this.args.setHeaderLockedStatus(this.isEditing);
  };
}
