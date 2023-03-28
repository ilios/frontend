import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import SessionObject from 'ilios-common/classes/session-object';
import { getOwner } from '@ember/application';
import { mapBy } from 'ilios-common/utils/array-helpers';

const DEBOUNCE_DELAY = 250;

export default class CourseSessionsComponent extends Component {
  @service intl;
  @service permissionChecker;
  @service dataLoader;

  @tracked expandedSessionIds = [];
  @tracked filterByLocalCache = [];
  @tracked showNewSessionForm = false;

  @use loadedCourseSessions = new ResolveAsyncValue(() => [
    this.dataLoader.loadCourseSessions(this.args.course.id),
  ]);
  @use sessionTypes = new ResolveAsyncValue(() => [this.school?.sessionTypes, []]);
  @use courseSessions = new ResolveAsyncValue(() => [this.args.course.sessions]);
  @use school = new ResolveAsyncValue(() => [this.args.course.school]);

  get sessions() {
    if (!this.loadedCourseSessions) {
      return false;
    }

    return this.courseSessions;
  }

  get sessionsCount() {
    return this.args.course.hasMany('sessions').ids().length;
  }

  get showExpandAll() {
    return this.sessionsWithOfferings.length;
  }

  get sessionsWithOfferings() {
    if (!this.sessions) {
      return [];
    }
    return this.sessions.filter((session) => {
      const ids = session.hasMany('offerings').ids();
      return ids.length > 0;
    });
  }

  get sessionObjects() {
    if (!this.sessions) {
      return false;
    }
    return this.sessions.map((session) => new SessionObject(getOwner(this), session));
  }

  get filterByDebounced() {
    if (this.changeFilterBy.isIdle) {
      return this.args.filterBy;
    }

    return this.filterByLocalCache;
  }

  saveSession = task(async (session) => {
    session.set('course', this.args.course);

    return await session.save();
  });

  expandSession = task(async (session) => {
    await timeout(1);
    this.expandedSessionIds = [...this.expandedSessionIds, session.id];
  });

  closeSession = task(async (session) => {
    await timeout(1);
    this.expandedSessionIds = this.expandedSessionIds.filter((id) => id !== session.id);
  });

  changeFilterBy = restartableTask(async (event) => {
    const value = event.target.value;
    this.filterByLocalCache = value;
    await timeout(DEBOUNCE_DELAY);
    this.args.setFilterBy(value);
  });

  @action
  toggleExpandAll() {
    if (this.expandedSessionIds.length === this.sessionsWithOfferings.length) {
      this.expandedSessionIds = [];
    } else {
      this.expandedSessionIds = mapBy(this.sessionsWithOfferings, 'id');
    }
  }
}
