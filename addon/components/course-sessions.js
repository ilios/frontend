import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { map } from 'rsvp';
import { timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, restartableTask } from 'ember-concurrency-decorators';
const DEBOUNCE_DELAY = 250;

export default class CourseSessionsComponent extends Component {
  @service intl;
  @service permissionChecker;

  @tracked sessions = [];
  @tracked expandedSessionIds = [];
  @tracked sessionObjects = false;
  @tracked sessionTypes = [];
  @tracked filterByLocalCache = [];
  @tracked showNewSessionForm = false;

  @restartableTask
  *load(event, [sessions, school]) {
    if (!sessions) {
      return;
    }
    this.sessions = sessions.toArray();
    this.sessionObjects = yield this.buildSessionObjects();
    this.sessionTypes = yield school.sessionTypes;
  }

  get sessionsCount(){
    const sessionIds = this.args.course.hasMany('sessions').ids();
    return sessionIds.length;
  }

  get sessionsWithOfferings() {
    return this.sessions.filter(session => {
      const ids = session.hasMany('offerings').ids();
      return ids.length > 0;
    });
  }

  async buildSessionObjects(){
    const sessionObjects = await map(this.sessions, async session => {
      const canDelete = await this.permissionChecker.canDeleteSession(session);
      const canUpdate = await this.permissionChecker.canUpdateSession(session);
      const postrequisite = await session.postrequisite;
      const sessionObject = {
        session,
        course: this.args.course,
        canDelete,
        canUpdate,
        postrequisite,
        id: session.id,
        title: session.title,
        instructionalNotes: session.instructionalNotes,
        isPublished: session.isPublished,
        isNotPublished: session.isNotPublished,
        isScheduled: session.isScheduled
      };
      const sessionType = await session.sessionType;
      sessionObject.sessionTypeTitle = sessionType.title;
      const ilmSession = await session.ilmSession;
      if (ilmSession) {
        sessionObject.isIlm = true;
        sessionObject.firstOfferingDate = ilmSession.dueDate;
      } else {
        sessionObject.isIlm = false;
        sessionObject.firstOfferingDate = await session.firstOfferingDate;
      }
      const offerings = await session.offerings;
      sessionObject.offeringCount = offerings.length;
      sessionObject.objectiveCount = session.hasMany('objectives').ids().length;
      sessionObject.termCount = session.hasMany('terms').ids().length;
      const offeringLearnerGroupCount = offerings.reduce((total, offering) => {
        const count = offering.hasMany('learnerGroups').ids().length;

        return total + count;
      }, 0);
      let ilmLearnerGroupCount = 0;
      if (ilmSession) {
        const learnerGroupIds = ilmSession.hasMany('learnerGroups').ids();
        ilmLearnerGroupCount = learnerGroupIds.length;
      }
      const learnerGroupCount = offeringLearnerGroupCount + ilmLearnerGroupCount;
      sessionObject.learnerGroupCount = learnerGroupCount;
      let status = this.intl.t('general.notPublished');
      if(session.published){
        sessionObject.isPublished = true;
        status = this.intl.t('general.published');
      }
      if(session.publishedAsTbd){
        sessionObject.publishedAsTbd = true;
        status = this.intl.t('general.scheduled');
      }
      sessionObject.status = status.toString();
      sessionObject.searchString = sessionObject.title + sessionObject.sessionTypeTitle + sessionObject.status;

      return sessionObject;
    });

    return sessionObjects;
  }

  get filterByDebounced(){
    if (this.changeFilterBy.isIdle) {
      return this.args.filterBy;
    }

    return this.filterByLocalCache;
  }

  @task
  *saveSession(session) {
    session.set('course', this.args.course);

    return yield session.save();
  }

  @task
  *expandSession(session) {
    yield timeout(1);
    this.expandedSessionIds = [...this.expandedSessionIds, session.id];
  }

  @task
  *closeSession(session) {
    yield timeout(1);
    this.expandedSessionIds = this.expandedSessionIds.filter(id => id !== session.id);
  }

  @restartableTask
  *changeFilterBy(value){
    this.filterByLocalCache = value;
    yield timeout(DEBOUNCE_DELAY);
    this.args.setFilterBy(value);
  }

  @action
  toggleExpandAll() {
    if (this.expandedSessionIds.length === this.sessionsWithOfferings.length) {
      this.expandedSessionIds = [];
    } else {
      this.expandedSessionIds = this.sessionsWithOfferings.mapBy('id');
    }
  }
}
