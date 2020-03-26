import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class NewObjectiveComponent extends Component {
  @service store;
  @tracked smallGroupMode = true;

  @action
  async save(startDate, endDate, room, learnerGroups, learners, instructorGroups, instructors){
    const offering = this.store.createRecord('offering', {
      startDate,
      endDate,
      room,
      learnerGroups,
      learners,
      instructorGroups,
      instructors,
      session: this.args.session
    });

    return offering.save();
  }
}
