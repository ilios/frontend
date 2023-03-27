/* eslint-disable ember/no-computed-properties-in-native-classes */
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class SessionPublicationCheckComponent extends Component {
  @service router;
  @tracked objectivesRelationship;

  @use course = new ResolveAsyncValue(() => [this.args.session.course]);
  @use school = new ResolveAsyncValue(() => [this.course?.school]);
  @use sessionTypes = new ResolveAsyncValue(() => [this.school?.sessionTypes]);

  @computed('objectivesRelationship.@each.courseObjectives')
  get showUnlinkIcon() {
    if (!this.objectivesRelationship) {
      return false;
    }
    return Boolean(
      this.objectivesRelationship.find((objective) => {
        const parentIds = objective.hasMany('courseObjectives').ids();
        return parentIds.length === 0;
      })
    );
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
