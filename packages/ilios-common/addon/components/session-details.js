import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import scrollIntoView from 'scroll-into-view';

export default class SessionDetailsComponent extends Component {
  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.course?.cohorts);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  @action
  scrollTo(element) {
    scrollIntoView(element, { align: { top: 0 } });
  }
}
