import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class SessionPostrequisiteEditorComponent extends Component {
  @tracked filter = '';
  @tracked userSelectedPostrequisite = false;

  @cached
  get currentPostrequisiteData() {
    return new TrackedAsyncData(this.args.session.postrequisite);
  }

  get currentPostrequisite() {
    return this.currentPostrequisiteData.isResolved ? this.currentPostrequisiteData.value : null;
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.course?.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  get selectedPostrequisite() {
    if (this.userSelectedPostrequisite !== false) {
      return this.userSelectedPostrequisite;
    }
    return this.currentPostrequisite;
  }

  get linkablePostrequisites() {
    if (!this.sessions) {
      return [];
    }
    return sortBy(
      this.sessions.filter((session) => session.id !== this.args.session.id),
      'title',
    );
  }

  save = task(async () => {
    this.args.session.set('postrequisite', this.selectedPostrequisite);
    await this.args.session.save();
    this.args.close();
  });

  get filteredPostrequisites() {
    if (!this.filter) {
      return this.linkablePostrequisites;
    }
    const exp = new RegExp(escapeRegExp(this.filter), 'gi');
    return this.linkablePostrequisites.filter((session) => session.title.match(exp));
  }
}
