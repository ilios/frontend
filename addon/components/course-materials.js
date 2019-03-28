import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { isEmpty, isPresent } from '@ember/utils';
import { all, task, timeout } from 'ember-concurrency';
import layout from '../templates/components/course-materials';
import DS from 'ember-data';

const { PromiseArray } = DS;

const DEBOUNCE_DELAY = 250;

export default Component.extend({
  layout,

  classNames: ['course-materials'],

  clmQuery: '',
  course: null,
  courseSort: null,
  sessionSort: null,
  slmQuery: '',
  onClmSort() {},
  onSlmSort() {},
  typesWithUrl: Object.freeze(['file', 'link']),

  isClmLoading: reads('courseLearningMaterialObjects.isPending'),
  isSlmLoading: reads('sessionLearningMaterialObjects.isPending'),

  courseLearningMaterialObjects: computed(function() {
    const promise = this.fetchCourseLearningMaterials();
    return PromiseArray.create({ promise });
  }),

  sessionLearningMaterialObjects: computed(function() {
    const promise = this.fetchSessionLearningMaterials();
    return PromiseArray.create({ promise });
  }),

  filteredCourseLearningMaterialObjects: computed(
    'courseLearningMaterialObjects', 'clmQuery', function() {
      const q = this.clmQuery;
      const clmo = this.courseLearningMaterialObjects;
      return isEmpty(q) ? clmo : this.filterClmo(clmo);
    }
  ),

  filteredSessionLearningMaterialObjects: computed(
    'sessionLearningMaterialObjects', 'slmQuery', function() {
      const q = this.slmQuery;
      const slmo = this.sessionLearningMaterialObjects;
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
    clmSortBy(prop) {
      if (this.courseSort === prop) {
        prop += ':desc';
      }
      this.onClmSort(prop);
    },

    slmSortBy(prop) {
      if (this.sessionSort === prop) {
        prop += ':desc';
      }
      this.onSlmSort(prop);
    }
  },

  setClmQuery: task(function* (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.set('clmQuery', q);
  }).restartable(),

  setSlmQuery: task(function* (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.set('slmQuery', q);
  }).restartable(),

  async fetchCourseLearningMaterials() {
    const clms = await this.course.get('learningMaterials');
    const promises = clms.map((clm) => this.buildClmObject(clm));
    return await all(promises);
  },

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

  async fetchSessionLearningMaterials() {
    const sessions = await this.course.sessions;
    const lms = await all(sessions.mapBy('learningMaterials'));
    const slms = lms.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);
    const promises = slms.map((slm) => this.buildSlmObject(slm));
    return await all(promises);
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
    const exp = new RegExp(this.clmQuery, 'gi');
    return clmo.filter((obj) => {
      return (isPresent(obj.title) && obj.title.match(exp)) ||
             (isPresent(obj.description) && obj.description.match(exp)) ||
             (isPresent(obj.author) && obj.author.match(exp)) ||
             (isPresent(obj.type) && obj.type.match(exp)) ||
             (isPresent(obj.citation) && obj.citation.match(exp));
    });
  },

  filterSlmo(slmo) {
    const exp = new RegExp(this.slmQuery, 'gi');
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
