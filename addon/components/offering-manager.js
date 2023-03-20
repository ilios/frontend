import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class OfferingManagerComponent extends Component {
  @service intl;
  @tracked isEditing = false;
  @tracked showRemoveConfirmation = false;
  @tracked hoveredGroups = [];

  @use learnerGroups = new ResolveAsyncValue(() => [this.args.offering.learnerGroups]);
  @use session = new ResolveAsyncValue(() => [this.args.offering?.session]);
  @use course = new ResolveAsyncValue(() => [this.session?.course]);
  @use cohorts = new ResolveAsyncValue(() => [this.course?.cohorts]);

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

  @action
  setLearnerGroupElement(element, [id]) {
    set(this, `learnerGroupElement${id}`, element);
  }
}
