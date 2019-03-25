import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { or, reads } from '@ember/object/computed';
import { isEmpty, isPresent } from '@ember/utils';
import { all, task, timeout } from 'ember-concurrency';
import layout from '../templates/components/course-materials';

const DEBOUNCE_DELAY = 250;

export default Component.extend({
  layout,

  classNames: ['course-materials'],

  course: null,
  clmQuery: '',
  clmSortBy: null,
  slmQuery: '',
  slmSortBy: null,
  onClmSort() {},
  onSlmSort() {},
  typesWithUrl: Object.freeze(['file', 'link']),

  isClmLoading: reads('courseLearningMaterialObjects.isRunning'),

  isSlmLoading: or(
    'sessionLearningMaterials.isRunning',
    'sessionLearningMaterialObjects.isRunning'
  ),

  filteredCouseLearningMaterialObjects: computed(
    'courseLearningMaterialObjects.last.value', 'clmQuery', function() {
      const q = this.clmQuery;
      const clmo = this.courseLearningMaterialObjects.last.value;
      return isEmpty(q) ? clmo : this.filterClmo(clmo);
    }
  ),

  filteredSessionLearningMaterialObjects: computed(
    'sessionLearningMaterialObjects.last.value', 'slmQuery', function() {
      const q = this.slmQuery;
      const slmo = this.sessionLearningMaterialObjects.last.value;
      return isEmpty(q) ? slmo : this.filterSlmo(slmo);
    }
  ),

  clmSortedAscending: computed('clmSortBy', function() {
    return this.clmSortBy.search(/desc/) === -1;
  }),

  slmSortedAscending: computed('slmSortBy', function() {
    return this.slmSortBy.search(/desc/) === -1;
  }),

  actions: {
    clmSortBy(prop) {
      if (this.clmSortBy === prop) {
        prop += ':desc';
      }
      this.onClmSort(prop);
    },

    slmSortBy(prop) {
      if (this.slmSortBy === prop) {
        prop += ':desc';
      }
      this.onSlmSort(prop);
    }
  },

  courseLearningMaterialObjects: task(function* () {
    const clms = yield this.course.get('learningMaterials');
    const promises = clms.map((clm) => this.buildClmObject.perform(clm));
    return yield all(promises);
  }).on('init'),

  buildClmObject: task(function* (clm) {
    const lm = yield clm.get('learningMaterial');
    return EmberObject.create({
      author: lm.originalAuthor,
      citation: lm.citation,
      description: lm.description,
      title: lm.title,
      type: lm.type,
      url: lm.url,
    });
  }),

  sessionLearningMaterials: task(function* () {
    const sessions = yield this.course.sessions;
    const lms = yield all(sessions.mapBy('learningMaterials'));
    const result = lms.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);
    this.sessionLearningMaterialObjects.perform(result);
    return result;
  }).on('init'),

  sessionLearningMaterialObjects: task(function* (slms) {
    const promises = slms.map((slm) => this.buildSlmObject.perform(slm));
    return yield all(promises);
  }),

  buildSlmObject: task(function* (slm) {
    const lm = yield slm.get('learningMaterial');
    const session = yield slm.session;
    const firstOfferingDate = yield session.firstOfferingDate;
    return EmberObject.create({
      author: lm.originalAuthor,
      citation: lm.citation,
      description: lm.description,
      firstOfferingDate,
      sessionTitle: session.title,
      title: lm.title,
      type: lm.type,
      url: lm.url,
    });
  }),

  setClmQuery: task(function* (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.set('clmQuery', q);
  }).restartable(),

  setSlmQuery: task(function* (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.set('slmQuery', q);
  }).restartable(),

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
