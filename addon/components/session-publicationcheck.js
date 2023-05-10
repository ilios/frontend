import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

export default class SessionPublicationCheckComponent extends Component {
  @service router;

  @use course = new ResolveAsyncValue(() => [this.args.session.course]);
  @use school = new ResolveAsyncValue(() => [this.course?.school]);
  @use sessionTypes = new ResolveAsyncValue(() => [this.school?.sessionTypes]);
  @use sessionObjectives = new ResolveAsyncValue(() => [this.args.session.sessionObjectives, []]);

  get showUnlinkIcon() {
    const objectivesWithoutParents = this.sessionObjectives.filter((objective) => {
      return objective.courseObjectives.length === 0;
    });

    return objectivesWithoutParents.length > 0;
  }

  @action
  transitionToSession() {
    const queryParams = { sessionObjectiveDetails: true };
    this.router.transitionTo('session', this.args.session, { queryParams });
  }
}
