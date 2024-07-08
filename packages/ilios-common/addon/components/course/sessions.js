import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { mapBy } from 'ilios-common/utils/array-helpers';

const DEBOUNCE_DELAY = 250;

export default class CourseSessionsComponent extends Component {
  @service intl;
  @service permissionChecker;
  @service dataLoader;

  @tracked expandedSessionIds = [];
  @tracked filterByLocalCache = [];
  @tracked showNewSessionForm = false;

  @tracked tableHeadersLocked = true;

  @action
  setHeaderLockedStatus(isEditing) {
    this.tableHeadersLocked = !isEditing;
  }

  @cached
  get loadedCourseSessionsData() {
    return new TrackedAsyncData(this.dataLoader.loadCourseSessions(this.args.course.id));
  }

  @cached
  get sessionTypesData() {
    if (!this.school) {
      return null;
    }
    return new TrackedAsyncData(this.school.sessionTypes);
  }

  @cached
  get courseSessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.args.course.school);
  }

  get loadedCourseSessions() {
    return this.loadedCourseSessionsData.isResolved ? this.loadedCourseSessionsData.value : null;
  }

  get sessionTypes() {
    return this.sessionTypesData?.isResolved ? this.sessionTypesData.value : [];
  }

  get courseSessions() {
    return this.courseSessionsData.isResolved ? this.courseSessionsData.value : null;
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

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
