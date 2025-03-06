import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { modifier } from 'ember-modifier';
import { TrackedAsyncData } from 'ember-async-data';

export default class OfferingManagerComponent extends Component {
  @service intl;
  @tracked isEditing = false;
  @tracked showRemoveConfirmation = false;
  @tracked hoveredGroups = [];

  setLearnerGroupElement = modifier((element, [id]) => {
    set(this, `learnerGroupElement${id}`, element);
  });

  @cached
  get learnerGroupsData() {
    return new TrackedAsyncData(this.args.offering.learnerGroups);
  }

  @cached
  get sessionData() {
    return new TrackedAsyncData(this.args.offering?.session);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.session?.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  get learnerGroups() {
    return this.learnerGroupsData.isResolved ? this.learnerGroupsData.value : null;
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

  get cohortsLoaded() {
    return !!this.cohorts;
  }

  @action
  save(startDate, endDate, room, url, learnerGroups, learners, instructorGroups, instructors) {
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

    return this.args.offering.save();
  }

  get sortedLearnerGroups() {
    if (!this.learnerGroups) {
      return [];
    }
    return this.learnerGroups.slice().sort((learnerGroupA, learnerGroupB) => {
      const locale = this.intl.get('locale');
      if ('title:desc' === this.sortBy) {
        return learnerGroupB.title.localeCompare(learnerGroupA.title, locale, { numeric: true });
      }
      return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, { numeric: true });
    });
  }

  @action
  toggleHover(id) {
    if (this.hoveredGroups.includes(id)) {
      this.hoveredGroups = this.hoveredGroups.filter((theId) => theId !== id);
    } else {
      this.hoveredGroups = [...this.hoveredGroups, id];
    }
  }

  textCopied = task(async () => {
    await timeout(3000);
  });
}
