import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveFlatMapBy from 'ilios-common/classes/resolve-flat-map-by';

const DEBOUNCE_DELAY = 250;

export default class CourseMaterialsComponent extends Component {
  @service dataLoader;
  @tracked courseQuery;
  @tracked sessionQuery;

  typesWithUrl = ['file', 'link'];

  @cached
  get courseMaterialsData() {
    return new TrackedAsyncData(this.args.course.learningMaterials);
  }

  @cached
  get loadedCourseSessionsData() {
    return new TrackedAsyncData(this.dataLoader.loadCourseSessions(this.args.course.id));
  }

  @cached
  get courseSessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get courseMaterials() {
    return this.courseMaterialsData.isResolved ? this.courseMaterialsData.value : null;
  }

  get loadedCourseSessions() {
    return this.loadedCourseSessionsData.isResolved ? this.loadedCourseSessionsData.value : null;
  }

  get courseSessions() {
    return this.courseSessionsData.isResolved ? this.courseSessionsData.value : null;
  }

  get sessions() {
    if (!this.loadedCourseSessions) {
      return false;
    }

    return this.courseSessions;
  }

  @use sessionMaterials = new ResolveFlatMapBy(() => [this.sessions, 'learningMaterials']);
  @use courseMaterialLms = new ResolveFlatMapBy(() => [this.courseMaterials, 'learningMaterial']);
  @use sessionMaterialObjects = new AsyncProcess(() => [
    this.buildSessionMaterials.bind(this),
    this.sessionMaterials,
  ]);

  get isLoading() {
    return !this.courseMaterialLms || !this.sessionMaterialObjects;
  }

  get filteredCourseLearningMaterials() {
    if (!this.courseMaterialLms) {
      return [];
    }
    const q = cleanQuery(this.courseQuery);
    if (!q) {
      return this.courseMaterialLms;
    }
    const exp = new RegExp(q, 'gi');
    return this.courseMaterialLms.filter((obj) => {
      return (
        (obj.title && obj.title.match(exp)) ||
        (obj.description && obj.description.match(exp)) ||
        (obj.originalAuthor && obj.originalAuthor.match(exp)) ||
        (obj.type && obj.type.match(exp)) ||
        (obj.citation && obj.citation.match(exp))
      );
    });
  }

  get filteredSessionLearningMaterialObjects() {
    if (!this.sessionMaterialObjects) {
      return [];
    }
    const q = cleanQuery(this.sessionQuery);
    if (!q) {
      return this.sessionMaterialObjects;
    }
    const exp = new RegExp(q, 'gi');
    return this.sessionMaterialObjects.filter((obj) => {
      return (
        (obj.lm.title && obj.lm.title.match(exp)) ||
        (obj.lm.description && obj.lm.description.match(exp)) ||
        (obj.lm.originalAuthor && obj.lm.originalAuthor.match(exp)) ||
        (obj.lm.type && obj.lm.type.match(exp)) ||
        (obj.lm.citation && obj.lm.citation.match(exp)) ||
        (obj.session.title && obj.session.title.match(exp))
      );
    });
  }

  get clmSortedAscending() {
    return this.args.courseSort.search(/desc/) === -1;
  }

  get slmSortedAscending() {
    return this.args.sessionSort.search(/desc/) === -1;
  }

  @action
  courseSortBy(prop) {
    if (this.args.courseSort === prop) {
      prop += ':desc';
    }
    this.args.onCourseSort(prop);
  }

  @action
  sessionSortBy(prop) {
    if (this.args.sessionSort === prop) {
      prop += ':desc';
    }
    this.args.onSessionSort(prop);
  }

  setCourseQuery = restartableTask(async (q) => {
    await timeout(DEBOUNCE_DELAY);
    this.courseQuery = q;
  });

  setSessionQuery = restartableTask(async (q) => {
    await timeout(DEBOUNCE_DELAY);
    this.sessionQuery = q;
  });

  /**
   * Resolve session and LMs, so they can be used synchronous
   * in the filter.
   */
  async buildSessionMaterials(materials) {
    if (!materials) {
      return null;
    }
    return map(materials, async (slm) => {
      const lm = await slm.get('learningMaterial');
      const session = await slm.session;
      return {
        session,
        lm,
      };
    });
  }
}
