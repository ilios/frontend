import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

const DEBOUNCE_DELAY = 250;

export default class CourseMaterialsComponent extends Component {
  @service dataLoader;
  @service store;
  @tracked courseQuery;
  @tracked sessionQuery;

  typesWithUrl = ['file', 'link'];

  @cached
  get courseMaterialsData() {
    return new TrackedAsyncData(this.args.course.learningMaterials);
  }

  @cached
  get courseSessionsData() {
    return new TrackedAsyncData(this.dataLoader.loadCourseSessions(this.args.course.id));
  }

  @cached
  get sessionMaterialsData() {
    if (!this.courseSessionsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      Promise.all(this.courseSessionsData.value.map((s) => s.learningMaterials)),
    );
  }

  @cached
  get sessionMaterialLmsData() {
    if (!this.sessionMaterialsData?.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this.sessionMaterialsData.value.flat().map((s) => s.learningMaterial)),
    );
  }

  @cached
  get courseMaterialLmsData() {
    if (!this.courseMaterialsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this.courseMaterialsData.value.map((c) => c.learningMaterial)),
    );
  }

  /**
   * Resolve session and LMs, so they can be used synchronous
   * in the filter.
   */
  get sessionMaterialObjects() {
    if (!this.sessionMaterialsData?.isResolved || !this.sessionMaterialLmsData?.isResolved) {
      return null;
    }

    return this.sessionMaterialsData.value.flat().map((slm) => {
      const lm = this.store.peekRecord('learning-material', slm.belongsTo('learningMaterial').id());
      const session = this.store.peekRecord('session', slm.belongsTo('session').id());
      return {
        session,
        lm,
      };
    });
  }

  get isLoading() {
    return !this.courseMaterialLmsData?.isResolved || !this.sessionMaterialLmsData?.isResolved;
  }

  get filteredCourseLearningMaterials() {
    if (!this.courseMaterialLmsData?.isResolved) {
      return [];
    }
    const q = cleanQuery(this.courseQuery);
    if (!q) {
      return this.courseMaterialLmsData.value;
    }
    const exp = new RegExp(q, 'gi');
    return this.courseMaterialLmsData.value.filter((obj) => {
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
}
