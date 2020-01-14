import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';

export default class SessionPublicationCheckComponent extends Component {
  @service router;
  @tracked objectives = [];

  @computed('objectives.@each.parents')
  get showUnlinkIcon() {
    const objectivesWithoutParents = this.objectives.filter(objective => {
      const parentIds = objective.hasMany('parents').ids();
      return parentIds.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }
  @action
  load(event, [objectives]) {
    if (!objectives) {
      this.objectives = [];
      return;
    }
    this.objectives = objectives.toArray();
  }

  @action
  transitionToSession() {
    const queryParams = { sessionObjectiveDetails: true };
    this.router.transitionTo('session', this.args.session, { queryParams });
  }
}
