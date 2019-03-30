import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { all, task, timeout } from 'ember-concurrency';
import layout from '../templates/components/course-materials';
import { cleanQuery } from 'ilios-common/utils/query-utils';

const DEBOUNCE_DELAY = 250;

export default Component.extend({
  layout,

  classNames: ['course-materials'],

  course: null,
  courseQuery: '',
  courseSort: null,
  sessionQuery: '',
  sessionSort: null,
  onCourseSort() {},
  onSessionSort() {},
  typesWithUrl: Object.freeze(['file', 'link']),

  courseLearningMaterialObjects: computed(
    'course.learningMaterials.[]', async function() {
      const clms = await this.course.get('learningMaterials');
      const promises = clms.map((clm) => this.buildClmObject(clm));
      return await all(promises);
    }
  ),

  sessionLearningMaterialObjects: computed(
    'course.sessions.[]', async function() {
      const sessions = await this.course.sessions;
      const lms = await all(sessions.mapBy('learningMaterials'));
      const slms = lms.reduce((flattened, obj) => {
        return flattened.pushObjects(obj.toArray());
      }, []);
      const promises = slms.map((slm) => this.buildSlmObject(slm));
      return await all(promises);
    }
  ),

  filteredCourseLearningMaterialObjects: computed(
    'courseLearningMaterialObjects.[]', 'courseQuery', async function() {
      const q = cleanQuery(this.courseQuery);
      const clmo = await this.courseLearningMaterialObjects;
      return isEmpty(q) ? clmo : this.filterClmo(clmo);
    }
  ),

  filteredSessionLearningMaterialObjects: computed(
    'sessionLearningMaterialObjects.[]', 'sessionQuery', async function() {
      const q = cleanQuery(this.sessionQuery);
      const slmo = await this.sessionLearningMaterialObjects;
      return isEmpty(q) ? slmo : this.filterSlmo(slmo);
    }
  ),

  clmSortedAscending: computed('courseSort', function() {
    return this.courseSort.search(/desc/) === -1;
  }),

  slmSortedAscending: computed('sessionSort', function() {
    return this.sessionSort.search(/desc/) === -1;
  }),

  actions: {
    courseSortBy(prop) {
      if (this.courseSort === prop) {
        prop += ':desc';
      }
      this.onCourseSort(prop);
    },

    sessionSortBy(prop) {
      if (this.sessionSort === prop) {
        prop += ':desc';
      }
      this.onSessionSort(prop);
    }
  },

  setCourseQuery: task(function* (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.set('courseQuery', q);
  }).restartable(),

  setSessionQuery: task(function* (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.set('sessionQuery', q);
  }).restartable(),

  async buildClmObject(clm) {
    const lm = await clm.get('learningMaterial');
    return EmberObject.create({
      author: lm.originalAuthor,
      citation: lm.citation,
      description: lm.description,
      title: lm.title,
      type: lm.type,
      url: lm.url
    });
  },

  async buildSlmObject(slm) {
    const lm = await slm.get('learningMaterial');
    const session = await slm.session;
    const firstOfferingDate = await session.firstOfferingDate;
    return EmberObject.create({
      author: lm.originalAuthor,
      citation: lm.citation,
      description: lm.description,
      firstOfferingDate,
      sessionTitle: session.title,
      title: lm.title,
      type: lm.type,
      url: lm.url
    });
  },

  filterClmo(clmo) {
    const exp = new RegExp(this.courseQuery, 'gi');
    return clmo.filter((obj) => {
      return (isPresent(obj.title) && obj.title.match(exp)) ||
             (isPresent(obj.description) && obj.description.match(exp)) ||
             (isPresent(obj.author) && obj.author.match(exp)) ||
             (isPresent(obj.type) && obj.type.match(exp)) ||
             (isPresent(obj.citation) && obj.citation.match(exp));
    });
  },

  filterSlmo(slmo) {
    const exp = new RegExp(this.sessionQuery, 'gi');
    return slmo.filter((obj) => {
      return (isPresent(obj.title) && obj.title.match(exp)) ||
             (isPresent(obj.description) && obj.description.match(exp)) ||
             (isPresent(obj.author) && obj.author.match(exp)) ||
             (isPresent(obj.type) && obj.type.match(exp)) ||
             (isPresent(obj.citation) && obj.citation.match(exp)) ||
             (isPresent(obj.sessionTitle) && obj.sessionTitle.match(exp));
    });
  }
});
