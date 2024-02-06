import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class SessionPublicationCheckComponent extends Component {
  @service router;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.course?.school);
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(this.school?.sessionTypes);
  }

  @cached
  get sessionObjectivesData() {
    return new TrackedAsyncData(this.args.session.sessionObjectives);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  get sessionTypes() {
    return this.sessionTypesData.isResolved ? this.sessionTypesData.value : null;
  }

  get sessionObjectives() {
    return this.sessionObjectivesData.isResolved ? this.sessionObjectivesData.value : [];
  }

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
