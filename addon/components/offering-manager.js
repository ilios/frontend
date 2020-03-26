import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OfferingManagerComponent extends Component {
  @tracked isEditing =  false;
  @tracked showRemoveConfirmation = false;

  @action
  save(startDate, endDate, room, learnerGroups, learners, instructorGroups, instructors){
    this.args.offering.setProperties({startDate, endDate, room, learnerGroups, learners, instructorGroups, instructors});

    return this.args.offering.save();
  }
}
