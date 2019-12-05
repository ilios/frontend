import Component from '@glimmer/component';
import { timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency-decorators';
const DEBOUNCE_DELAY = 250;

export default class CourseMaterialsComponent extends Component {
  @tracked courseLearningMaterialObjects = [];
  @tracked sessionLearningMaterialObjects = [];
  @tracked courseQuery;
  @tracked sessionQuery;

  constructor() {
    super(...arguments);
    this.typesWithUrl = ['file', 'link'];
  }

  @restartableTask
  *load(element, [
    courseLearningMaterials,
    sessions
  ]) {
    if (courseLearningMaterials) {
      this.courseLearningMaterialObjects = yield map(courseLearningMaterials.toArray(), async (clm) => {
        return await this.buildClmObject(clm);
      });
    }
    if (sessions) {
      const sessionMaterials = yield map(sessions.toArray(), async (session) => {
        const data = await session.learningMaterials;
        return data.toArray();
      });
      const flatSessionMaterials = sessionMaterials.flat(2);
      this.sessionLearningMaterialObjects = yield map(flatSessionMaterials, async (slm) => {
        return await this.buildSlmObject(slm);
      });
    }
  }

  get filteredCourseLearningMaterialObjects() {
    const q = cleanQuery(this.courseQuery);
    if (!q) {
      return this.courseLearningMaterialObjects;
    }
    const exp = new RegExp(q, 'gi');
    return this.courseLearningMaterialObjects.filter((obj) => {
      return (obj.title && obj.title.match(exp)) ||
             (obj.description && obj.description.match(exp)) ||
             (obj.author && obj.author.match(exp)) ||
             (obj.type && obj.type.match(exp)) ||
             (obj.citation && obj.citation.match(exp));
    });
  }

  get filteredSessionLearningMaterialObjects() {
    const q = cleanQuery(this.sessionQuery);
    if (!q) {
      return this.sessionLearningMaterialObjects;
    }
    const exp = new RegExp(q, 'gi');
    return this.sessionLearningMaterialObjects.filter((obj) => {
      return (obj.title && obj.title.match(exp)) ||
             (obj.description && obj.description.match(exp)) ||
             (obj.author && obj.author.match(exp)) ||
             (obj.type && obj.type.match(exp)) ||
             (obj.citation && obj.citation.match(exp)) ||
             (obj.sessionTitle && obj.sessionTitle.match(exp));
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

  @restartableTask
  *setCourseQuery (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.courseQuery = q;
  }

  @restartableTask
  *setSessionQuery(q) {
    yield timeout(DEBOUNCE_DELAY);
    this.sessionQuery = q;
  }

  async buildClmObject(clm) {
    const lm = await clm.get('learningMaterial');
    return {
      author: lm.originalAuthor,
      citation: lm.citation,
      description: lm.description,
      title: lm.title,
      type: lm.type,
      url: lm.url
    };
  }

  async buildSlmObject(slm) {
    const lm = await slm.get('learningMaterial');
    const session = await slm.session;
    const firstOfferingDate = await session.firstOfferingDate;
    return {
      author: lm.originalAuthor,
      citation: lm.citation,
      description: lm.description,
      firstOfferingDate,
      sessionTitle: session.title,
      title: lm.title,
      type: lm.type,
      url: lm.url
    };
  }
}
