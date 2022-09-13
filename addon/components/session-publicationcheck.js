/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import { restartableTask } from 'ember-concurrency';

export default class SessionPublicationCheckComponent extends Component {
  @service router;
  @tracked objectivesRelationship;

  @computed('objectivesRelationship.@each.courseObjectives')
  get showUnlinkIcon() {
    if (!this.objectivesRelationship) {
      return false;
    }
    return this.objectivesRelationship.slice().any((objective) => {
      const parentIds = objective.hasMany('courseObjectives').ids();
      return parentIds.length === 0;
    });
  }

  load = restartableTask(async () => {
    this.objectivesRelationship = await this.args.session.sessionObjectives;
  });

  @action
  transitionToSession() {
    const queryParams = { sessionObjectiveDetails: true };
    this.router.transitionTo('session', this.args.session, { queryParams });
  }
}
